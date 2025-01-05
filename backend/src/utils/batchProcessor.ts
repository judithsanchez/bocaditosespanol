import {BatchProcessorConfig} from 'lib/types';
import {logs, errors} from '../lib/constants';

export async function batchProcessor<T>({
	items,
	processingFn,
	batchSize,
	options,
}: BatchProcessorConfig<T>): Promise<T[]> {
	if (batchSize <= 0) throw new Error(errors.batchProcessing.invalidBatchSize);
	if (items.length === 0) throw new Error(errors.batchProcessing.emptyBatch);

	const results: T[] = [];
	const totalBatches = Math.ceil(items.length / batchSize);

	console.log('\n🚀 Batch Processing Started:', {
		totalItems: items.length,
		batchSize,
		totalBatches,
		retryAttempts: options.retryAttempts,
		delayBetweenBatches: options.delayBetweenBatches,
	});

	for (let i = 0; i < items.length; i += batchSize) {
		const currentBatch = Math.floor(i / batchSize) + 1;
		const batch = items.slice(i, i + batchSize);

		console.log(`\n📦 Processing Batch ${currentBatch}/${totalBatches}:`, {
			batchSize: batch.length,
			startIndex: i,
			endIndex: i + batch.length,
		});

		let attempts = 0;
		while (attempts < options.retryAttempts) {
			try {
				console.log(`🔄 Attempt ${attempts + 1}/${options.retryAttempts}`);
				const batchResults = await processingFn(batch);
				console.log('✅ Batch Success:', {
					resultsCount: batchResults.length,
					batchNumber: currentBatch,
				});
				results.push(...batchResults);
				break;
			} catch (error) {
				attempts++;
				console.error(
					`${errors.batchProcessing.processingFailed} Batch ${currentBatch}, Attempt ${attempts}`,
					error,
				);

				if (attempts === options.retryAttempts) {
					throw new Error(
						`${errors.batchProcessing.retryLimitExceeded} ${currentBatch}`,
					);
				}

				if (error instanceof Error && error.message.includes('RATE_LIMITED')) {
					console.error(errors.batchProcessing.rateLimitExceeded);
				}

				console.log(`⏳ Retrying in ${options.delayBetweenBatches}ms...`);
				await new Promise(resolve =>
					setTimeout(resolve, options.delayBetweenBatches),
				);
			}
		}

		if (i + batchSize < items.length) {
			console.log(`⏱️ Batch cooldown: ${options.delayBetweenBatches}ms`);
			await new Promise(resolve =>
				setTimeout(resolve, options.delayBetweenBatches),
			);
		}
	}

	console.log('\n🎉 Batch Processing Complete:', {
		totalProcessed: results.length,
		originalCount: items.length,
		timestamp: new Date().toISOString(),
	});

	return results;
}
