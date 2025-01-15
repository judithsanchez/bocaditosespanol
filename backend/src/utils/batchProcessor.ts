import {BatchProcessorConfig} from '../lib/types';
import {errors} from '../lib/constants';
import {Logger} from './Logger';

export async function batchProcessor<T>({
	items,
	processingFn,
	batchSize,
	options,
}: BatchProcessorConfig<T>): Promise<T[]> {
	const logger = new Logger('BatchProcessor');
	logger.start('batchProcessor');

	if (batchSize <= 0) {
		logger.error(
			'Invalid batch size',
			new Error(errors.batchProcessing.invalidBatchSize),
		);
		throw new Error(errors.batchProcessing.invalidBatchSize);
	}
	if (items.length === 0) {
		logger.error(
			'Empty batch provided',
			new Error(errors.batchProcessing.emptyBatch),
		);
		throw new Error(errors.batchProcessing.emptyBatch);
	}

	const results: T[] = [];
	const totalBatches = Math.ceil(items.length / batchSize);

	logger.info('Batch processing configuration', {
		totalItems: items.length,
		batchSize,
		totalBatches,
		retryAttempts: options.retryAttempts,
		delayBetweenBatches: options.delayBetweenBatches,
	});

	for (let i = 0; i < items.length; i += batchSize) {
		const currentBatch = Math.floor(i / batchSize) + 1;
		const batch = items.slice(i, i + batchSize);

		logger.info('Processing batch', {
			batchNumber: currentBatch,
			totalBatches,
			batchSize: batch.length,
			startIndex: i,
			endIndex: i + batch.length,
		});

		let attempts = 0;
		while (attempts < options.retryAttempts) {
			try {
				logger.info('Batch attempt', {
					attempt: attempts + 1,
					maxAttempts: options.retryAttempts,
				});

				const batchResults = await processingFn(batch);
				logger.info('Batch processed successfully', {
					batchNumber: currentBatch,
					resultsCount: batchResults.length,
				});

				results.push(...batchResults);
				break;
			} catch (error) {
				attempts++;
				logger.error(`Batch ${currentBatch} processing failed`, error);

				if (attempts === options.retryAttempts) {
					logger.error(
						'Retry limit exceeded',
						new Error(
							`${errors.batchProcessing.retryLimitExceeded} ${currentBatch}`,
						),
					);
					throw new Error(
						`${errors.batchProcessing.retryLimitExceeded} ${currentBatch}`,
					);
				}

				if (error instanceof Error && error.message.includes('RATE_LIMITED')) {
					logger.error('Rate limit exceeded', error);
				}

				logger.info('Retrying batch', {
					delay: options.delayBetweenBatches,
					nextAttempt: attempts + 1,
				});

				await new Promise(resolve =>
					setTimeout(resolve, options.delayBetweenBatches),
				);
			}
		}

		if (i + batchSize < items.length) {
			logger.info('Batch cooldown', {
				delay: options.delayBetweenBatches,
			});
			await new Promise(resolve =>
				setTimeout(resolve, options.delayBetweenBatches),
			);
		}
	}

	logger.info('Batch processing completed', {
		totalProcessed: results.length,
		originalCount: items.length,
		timestamp: new Date().toISOString(),
	});

	logger.end('batchProcessor');
	return results;
}
