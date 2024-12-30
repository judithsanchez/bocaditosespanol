import {errors} from '../lib/constants';

interface BatchProcessorConfig<T> {
	items: T[];
	processingFn: (item: T) => Promise<T>;
	batchSize: number;
	options?: {
		retryAttempts?: number;
		delayBetweenBatches?: number;
	};
}

export async function batchProcessor<T>({
	items,
	processingFn,
	batchSize,
	options = {},
}: BatchProcessorConfig<T>): Promise<T[]> {
	const {retryAttempts = 3, delayBetweenBatches = 1000} = options;
	const results: T[] = [];

	for (let i = 0; i < items.length; i += batchSize) {
		const batch = items.slice(i, i + batchSize);
		console.log(
			`\n🔄 Processing batch ${i / batchSize + 1}/${Math.ceil(
				items.length / batchSize,
			)}`,
		);

		let attempts = 0;
		let batchResults: T[] = [];

		while (attempts < retryAttempts) {
			try {
				const batchPromises = batch.map(item => processingFn(item));
				batchResults = await Promise.all(batchPromises);
				break;
			} catch (error) {
				attempts++;
				console.error(
					`❌ Batch processing failed. Attempt ${attempts}/${retryAttempts}`,
					error,
				);
				if (attempts === retryAttempts) {
					throw new Error(`${errors.processingError}: ${error}`);
				}
				await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
			}
		}

		results.push(...batchResults);
		console.log(`✅ Batch ${i / batchSize + 1} processed successfully`);

		if (i + batchSize < items.length) {
			await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
		}
	}

	return results;
}
