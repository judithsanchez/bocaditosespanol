import {z} from 'zod';
import {Logger} from './Logger';
import {errors} from '@/lib/types/constants';
// Import the interface from AIConfig - this is the one WITH batchSize
import {BatchOptions as ExternalBatchOptions} from '@/lib/config/AIConfig';

const batchProgressSchema = z.object({
	totalItems: z.number(),
	processedItems: z.number(),
	currentBatch: z.number(),
	totalBatches: z.number(),
	failedBatches: z.number(),
	startTime: z.number(),
	estimatedTimeRemaining: z.number().optional(),
});

// This schema defines the structure for the NESTED options in the process method
const internalBatchOptionsSchema = z.object({
	retryAttempts: z.number().positive(),
	delayBetweenBatches: z.number().positive(),
	maxRequestsPerMinute: z.number().positive(),
	timeoutMs: z.number().positive().optional(),
	maxConcurrentBatches: z.number().positive().optional(),
});

// This schema defines the structure for the argument to the process method
const batchConfigSchema = z.object({
	items: z.array(z.any()),
	processingFn: z
		.function()
		.args(z.array(z.any()))
		.returns(z.promise(z.array(z.any()))),
	batchSize: z.number().positive(), // Top-level batchSize
	options: internalBatchOptionsSchema, // Uses the schema WITHOUT batchSize
	onProgress: z.function().args(z.any()).returns(z.void()).optional(),
});

type BatchProgress = z.infer<typeof batchProgressSchema>;
// Define the internal options type based on the schema (WITHOUT batchSize)
// EXPORT this type for use in steps
export type InternalBatchOptions = z.infer<typeof internalBatchOptionsSchema>;

// Define the type for the argument to the process method
// EXPORT this type for use in steps
export type BatchConfig<T> = Omit<
	z.infer<typeof batchConfigSchema>,
	'items' | 'processingFn' | 'options' // Omit options derived from schema
> & {
	items: T[];
	processingFn: (items: T[]) => Promise<T[]>;
	options: InternalBatchOptions; // Explicitly use the internal type
};

class RateLimiter {
	private requestTimes: number[] = [];
	private maxRequests: number;
	private timeWindowMs: number;

	// Constructor uses the external options which might include things not used here directly
	// but RateLimiter only needs maxRequestsPerMinute
	constructor(config: ExternalBatchOptions, timeWindowMs: number = 60000) {
		this.maxRequests = config.maxRequestsPerMinute;
		this.timeWindowMs = timeWindowMs;
	}

	async waitIfNeeded(): Promise<void> {
		const now = Date.now();
		this.requestTimes = this.requestTimes.filter(
			time => now - time < this.timeWindowMs,
		);

		if (this.requestTimes.length >= this.maxRequests) {
			const oldestRequest = this.requestTimes[0];
			const waitTime = this.timeWindowMs - (now - oldestRequest);
			if (waitTime > 0) {
				await new Promise(resolve => setTimeout(resolve, waitTime));
			}
		}

		this.requestTimes.push(now);
	}
}

class BatchProcessingError extends Error {
	constructor(
		message: string,
		public batch: number,
		public attempt: number,
		public originalError?: Error,
	) {
		super(message);
		this.name = 'BatchProcessingError';
	}
}

export class BatchProcessor<T> {
	private logger: Logger;
	private rateLimiter: RateLimiter;

	// Constructor expects the external type (WITH batchSize, etc.)
	constructor(batchConfig: ExternalBatchOptions) {
		// Pass true to Logger constructor if BatchProcessor is considered a class context
		this.logger = new Logger('BatchProcessor', true);
		// RateLimiter only needs maxRequestsPerMinute from the external config
		this.rateLimiter = new RateLimiter(batchConfig);
	}

	// Process method expects the BatchConfig<T> type (top-level batchSize, nested options WITHOUT batchSize)
	async process(config: BatchConfig<T>): Promise<T[]> {
		// Validate the input config against the schema expecting the internal options structure
		const validatedConfig = batchConfigSchema.parse(config);
		this.logger.start('process');

		const progress: BatchProgress = {
			totalItems: validatedConfig.items.length,
			processedItems: 0,
			currentBatch: 0,
			totalBatches: Math.ceil(
				validatedConfig.items.length / validatedConfig.batchSize,
			),
			failedBatches: 0,
			startTime: Date.now(),
		};

		const results: T[] = [];

		for (
			let i = 0;
			i < validatedConfig.items.length;
			i += validatedConfig.batchSize
		) {
			progress.currentBatch++;
			const batch = validatedConfig.items.slice(
				i,
				i + validatedConfig.batchSize,
			);

			await this.rateLimiter.waitIfNeeded();

			// Pass validatedConfig (which now correctly matches BatchConfig<T> structure)
			const batchResults = await this.processBatch(
				batch,
				progress,
				validatedConfig,
			);
			results.push(...batchResults);

			progress.processedItems += batchResults.length; // Use actual results length
			validatedConfig.onProgress?.(progress);

			if (i + validatedConfig.batchSize < validatedConfig.items.length) {
				await new Promise(resolve =>
					// Use delay from the validated nested options
					setTimeout(resolve, validatedConfig.options.delayBetweenBatches),
				);
			}
		}

		this.logger.end('process');
		return results;
	}

	// processBatch expects BatchConfig<T> which has the nested options structure
	private async processBatch(
		batch: T[],
		progress: BatchProgress,
		config: BatchConfig<T>,
	): Promise<T[]> {
		// No need to parse progress again, it's managed internally
		// batchProgressSchema.parse(progress);

		let attempts = 0;
		const maxAttempts = config.options.retryAttempts;

		while (attempts < maxAttempts) {
			try {
				const timeoutMs = config.options.timeoutMs;
				const timeoutPromise = timeoutMs
					? new Promise<never>((_, reject) =>
							setTimeout(
								() => reject(new Error(`Batch timeout after ${timeoutMs}ms`)),
								timeoutMs,
							),
					  )
					: null;

				const batchPromise = config.processingFn(batch);

				const results = (await (timeoutPromise
					? Promise.race([batchPromise, timeoutPromise])
					: batchPromise)) as T[];

				this.logger.info('Batch processed successfully', {
					batchNumber: progress.currentBatch,
					itemsInBatch: batch.length,
					resultsCount: results.length,
				});

				return results; // Return successful results
			} catch (error: any) {
				attempts++;
				// FIX: Pass error object as second argument
				this.logger.error(
					`Batch ${progress.currentBatch} processing failed (Attempt ${attempts}/${maxAttempts})`,
					error, // Pass the caught error here
				);

				if (attempts >= maxAttempts) {
					progress.failedBatches++;
					const finalError = new BatchProcessingError(
						`${errors.batchProcessing.retryLimitExceeded} for batch ${progress.currentBatch}`,
						progress.currentBatch,
						attempts,
						error instanceof Error ? error : new Error(String(error)),
					);
					// FIX: Pass error object as second argument
					this.logger.error(
						`Batch ${progress.currentBatch} failed after ${maxAttempts} attempts.`,
						finalError, // Pass the final error being thrown
					);
					// Re-throw a specific error indicating retry limit exceeded
					throw finalError;
				}

				// Use delay from nested options for backoff
				const backoffDelay =
					config.options.delayBetweenBatches * Math.pow(2, attempts - 1); // Standard exponential backoff
				// FIX: Replace warn with info
				this.logger.info(
					`Retrying batch ${progress.currentBatch} after ${backoffDelay}ms delay.`,
					{attempt: attempts, maxAttempts: maxAttempts, delay: backoffDelay}, // Optional data
				);
				await new Promise(resolve => setTimeout(resolve, backoffDelay));
			}
		}

		// Should not be reached if maxAttempts > 0, but satisfies TypeScript if maxAttempts could be 0
		const finalMessage = `Batch ${progress.currentBatch} processing loop finished unexpectedly without success or exceeding retries.`;
		// FIX: Pass an error object as second argument
		this.logger.error(finalMessage, new Error(finalMessage));
		return []; // Return empty array or throw if this state is invalid
	}
}
