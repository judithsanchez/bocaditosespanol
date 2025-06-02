import {z} from 'zod';
import {Logger} from './Logger';
import {errors} from '@/lib/types/constants';
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

const internalBatchOptionsSchema = z.object({
	retryAttempts: z.number().positive(),
	delayBetweenBatches: z.number().positive(),
	maxRequestsPerMinute: z.number().positive(),
	timeoutMs: z.number().positive().optional(),
	maxConcurrentBatches: z.number().positive().optional(),
});

const batchConfigSchema = z.object({
	items: z.array(z.any()),
	processingFn: z
		.function()
		.args(z.array(z.any()))
		.returns(z.promise(z.array(z.any()))),
	batchSize: z.number().positive(),
	options: internalBatchOptionsSchema,
	onProgress: z.function().args(z.any()).returns(z.void()).optional(),
});

type BatchProgress = z.infer<typeof batchProgressSchema>;
export type InternalBatchOptions = z.infer<typeof internalBatchOptionsSchema>;

export type BatchConfig<T> = Omit<
	z.infer<typeof batchConfigSchema>,
	'items' | 'processingFn' | 'options'
> & {
	items: T[];
	processingFn: (items: T[]) => Promise<T[]>;
	options: InternalBatchOptions;
};

class RateLimiter {
	private requestTimes: number[] = [];
	private maxRequests: number;
	private timeWindowMs: number;

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

	constructor(batchConfig: ExternalBatchOptions) {
		this.logger = new Logger('BatchProcessor', true);
		this.rateLimiter = new RateLimiter(batchConfig);
	}

	async process(config: BatchConfig<T>): Promise<T[]> {
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

			const batchResults = await this.processBatch(
				batch,
				progress,
				validatedConfig,
			);
			results.push(...batchResults);

			progress.processedItems += batchResults.length;
			validatedConfig.onProgress?.(progress);

			if (i + validatedConfig.batchSize < validatedConfig.items.length) {
				await new Promise(resolve =>
					setTimeout(resolve, validatedConfig.options.delayBetweenBatches),
				);
			}
		}

		this.logger.end('process');
		return results;
	}

	private async processBatch(
		batch: T[],
		progress: BatchProgress,
		config: BatchConfig<T>,
	): Promise<T[]> {
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

				return results;
			} catch (error: any) {
				attempts++;
				this.logger.error(
					`Batch ${progress.currentBatch} processing failed (Attempt ${attempts}/${maxAttempts})`,
					error,
				);

				if (attempts >= maxAttempts) {
					progress.failedBatches++;
					const finalError = new BatchProcessingError(
						`${errors.batchProcessing.retryLimitExceeded} for batch ${progress.currentBatch}`,
						progress.currentBatch,
						attempts,
						error instanceof Error ? error : new Error(String(error)),
					);
					this.logger.error(
						`Batch ${progress.currentBatch} failed after ${maxAttempts} attempts.`,
						finalError,
					);
					throw finalError;
				}

				const backoffDelay =
					config.options.delayBetweenBatches * Math.pow(2, attempts - 1);
				this.logger.info(
					`Retrying batch ${progress.currentBatch} after ${backoffDelay}ms delay.`,
					{attempt: attempts, maxAttempts: maxAttempts, delay: backoffDelay},
				);
				await new Promise(resolve => setTimeout(resolve, backoffDelay));
			}
		}

		const finalMessage = `Batch ${progress.currentBatch} processing loop finished unexpectedly without success or exceeding retries.`;
		this.logger.error(finalMessage, new Error(finalMessage));
		return [];
	}
}
