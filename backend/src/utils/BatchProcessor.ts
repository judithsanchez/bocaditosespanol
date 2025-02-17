import {z} from 'zod';
import {Logger} from './Logger';
import {errors} from '../lib/constants';
import {BatchOptions} from 'config/AIConfig';

const batchProgressSchema = z.object({
	totalItems: z.number(),
	processedItems: z.number(),
	currentBatch: z.number(),
	totalBatches: z.number(),
	failedBatches: z.number(),
	startTime: z.number(),
	estimatedTimeRemaining: z.number().optional(),
});

const batchOptionsSchema = z.object({
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
	options: batchOptionsSchema,
	onProgress: z.function().args(z.any()).returns(z.void()).optional(),
});

type BatchProgress = z.infer<typeof batchProgressSchema>;
// type BatchOptions = z.infer<typeof batchOptionsSchema>;
type BatchConfig<T> = Omit<
	z.infer<typeof batchConfigSchema>,
	'items' | 'processingFn'
> & {
	items: T[];
	processingFn: (items: T[]) => Promise<T[]>;
};

class RateLimiter {
	private requestTimes: number[] = [];

	constructor(
		private maxRequests: number,
		private timeWindowMs: number = 60000,
	) {}

	async waitIfNeeded(): Promise<void> {
		const now = Date.now();
		this.requestTimes = this.requestTimes.filter(
			time => now - time < this.timeWindowMs,
		);

		if (this.requestTimes.length >= this.maxRequests) {
			const oldestRequest = this.requestTimes[0];
			const waitTime = this.timeWindowMs - (now - oldestRequest);
			await new Promise(resolve => setTimeout(resolve, waitTime));
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

	constructor(batchConfig: BatchOptions) {
		this.logger = new Logger('BatchProcessor');
		this.rateLimiter = new RateLimiter(batchConfig.maxRequestsPerMinute);
	}
	async process(config: BatchConfig<T>): Promise<T[]> {
		// const validatedConfig = batchConfigSchema.parse(config);
		this.logger.start('process');

		const progress: BatchProgress = {
			totalItems: config.items.length,
			processedItems: 0,
			currentBatch: 0,
			totalBatches: Math.ceil(config.items.length / config.batchSize),
			failedBatches: 0,
			startTime: Date.now(),
		};

		const results: T[] = [];

		for (let i = 0; i < config.items.length; i += config.batchSize) {
			progress.currentBatch++;
			const batch = config.items.slice(i, i + config.batchSize);

			await this.rateLimiter.waitIfNeeded();

			const batchResults = await this.processBatch(batch, progress, config);
			results.push(...batchResults);

			progress.processedItems += batchResults.length;
			config.onProgress?.(progress);

			if (i + config.batchSize < config.items.length) {
				await new Promise(resolve =>
					setTimeout(resolve, config.options.delayBetweenBatches),
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

		while (attempts < config.options.retryAttempts) {
			try {
				const timeoutPromise = config.options.timeoutMs
					? new Promise((_, reject) =>
							setTimeout(
								() => reject(new Error('Batch timeout')),
								config.options.timeoutMs,
							),
						)
					: null;

				const batchPromise = config.processingFn(batch);
				const results = (await (timeoutPromise
					? Promise.race([batchPromise, timeoutPromise])
					: batchPromise)) as T[];

				this.logger.info('Batch processed successfully', {
					batchNumber: progress.currentBatch,
					resultsCount: results.length,
				});

				return results;
			} catch (error) {
				attempts++;
				this.logger.error(
					`Batch ${progress.currentBatch} processing failed`,
					new BatchProcessingError(
						'Batch processing failed',
						progress.currentBatch,
						attempts,
						error instanceof Error ? error : undefined,
					),
				);

				if (attempts === config.options.retryAttempts) {
					progress.failedBatches++;
					throw new BatchProcessingError(
						errors.batchProcessing.retryLimitExceeded,
						progress.currentBatch,
						attempts,
					);
				}

				await new Promise(resolve =>
					setTimeout(resolve, config.options.delayBetweenBatches),
				);
			}
		}

		return [];
	}
}
