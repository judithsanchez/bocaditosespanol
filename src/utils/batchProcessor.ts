interface BatchProcessorConfig<T> {
	items: T[];
	processingFn: (items: T[]) => Promise<T[]>;
	batchSize: number;
	options: {
		retryAttempts: number;
		delayBetweenBatches: number;
		maxRequestsPerMinute: number;
	};
}

export async function batchProcessor<T>({
	items,
	processingFn,
	batchSize,
	options,
}: BatchProcessorConfig<T>): Promise<T[]> {
	const results: T[] = [];
	const totalBatches = Math.ceil(items.length / batchSize);

	console.log(`🎯 Starting batch processing: ${totalBatches} total batches`);

	for (let i = 0; i < items.length; i += batchSize) {
		const currentBatch = Math.floor(i / batchSize) + 1;
		const batch = items.slice(i, i + batchSize);

		console.log(`\n📦 Processing batch ${currentBatch}/${totalBatches}`);
		console.log(`📊 Batch size: ${batch.length} items`);

		let attempts = 0;
		while (attempts < options.retryAttempts) {
			try {
				const batchResults = await processingFn(batch);
				results.push(...batchResults);
				console.log(`✅ Batch ${currentBatch} completed successfully`);
				break;
			} catch (error) {
				attempts++;
				console.error(
					`❌ Batch ${currentBatch} failed. Attempt ${attempts}/${options.retryAttempts}`,
					error,
				);
				if (attempts === options.retryAttempts) {
					throw new Error(`Batch processing failed: ${error}`);
				}
				await new Promise(resolve =>
					setTimeout(resolve, options.delayBetweenBatches),
				);
			}
		}

		if (i + batchSize < items.length) {
			console.log(
				`⏳ Waiting ${options.delayBetweenBatches}ms before next batch...`,
			);
			await new Promise(resolve =>
				setTimeout(resolve, options.delayBetweenBatches),
			);
		}
	}

	return results;
}
