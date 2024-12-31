import {BatchProcessorConfig} from 'lib/types';
import {logs, errors} from '../lib/constants';

export async function batchProcessor<T>({
	items,
	processingFn,
	batchSize,
	options,
}: BatchProcessorConfig<T>): Promise<T[]> {
	const results: T[] = [];
	const totalBatches = Math.ceil(items.length / batchSize);

	for (let i = 0; i < items.length; i += batchSize) {
		const currentBatch = Math.floor(i / batchSize) + 1;
		const batch = items.slice(i, i + batchSize);

		let attempts = 0;
		while (attempts < options.retryAttempts) {
			try {
				const batchResults = await processingFn(batch);
				results.push(...batchResults);

				break;
			} catch (error) {
				attempts++;
				console.error(
					`${logs.batchProcessing.batchFailed} ${currentBatch} ${logs.batchProcessing.failed} ${attempts}${logs.batchProcessing.of}${options.retryAttempts}`,
					error,
				);
				if (attempts === options.retryAttempts) {
					throw new Error(`${errors.batchProcessingFailed} ${error}`);
				}
				await new Promise(resolve =>
					setTimeout(resolve, options.delayBetweenBatches),
				);
			}
		}

		if (i + batchSize < items.length) {
			await new Promise(resolve =>
				setTimeout(resolve, options.delayBetweenBatches),
			);
		}
	}

	return results;
}
