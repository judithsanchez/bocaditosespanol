export const errors = {
	mustBeString: 'Input must be a string',
	cantTokenize: 'Cannot tokenize an empty sentence',
	invalidData: 'Invalid data provided',
	processingError: 'Error processing text data',
	invalidText: 'Invalid text provided',
	failedToSaveData: 'Failed to save data:',
	batchProcessingFailed: 'Batch processing failed:',
	invalidTextData: 'Invalid text data provided',
	baseNameWithExtension: 'Please provide base name without extension',
	songIdMismatch: (expected: string, found: string) =>
		`Song ID mismatch in file. Expected: ${expected}, Found: ${found}`,
	aiProcessing: {
		requestFailed: 'AI request failed:',
		invalidResponse: 'Invalid AI response format:',
		parsingError: 'Error parsing AI response:',
		emptyResponse: 'Received empty response from AI',
		schemaValidation: 'Response schema validation failed:',
	},
	batchProcessing: {
		invalidBatchSize: 'Invalid batch size provided',
		processingFailed: 'Batch processing failed:',
		retryLimitExceeded: 'Retry limit exceeded for batch:',
		emptyBatch: 'Empty batch provided for processing',
		rateLimitExceeded: 'Rate limit exceeded, cooling down',
	},
};

export const logs = {
	dataSaved: '✅ Data saved with ID:',
	errorSavingData: '❌ Error saving data:',
	batchProcessing: {
		starting: '🎯 Starting batch processing:',
		totalBatches: 'total batches',
		processingBatch: '📦 Processing batch',
		batchSize: '📊 Batch size:',
		items: 'items',
		batchCompleted: '✅ Batch',
		completedSuccessfully: 'completed successfully',
		batchFailed: '❌ Batch',
		failed: 'failed. Attempt',
		of: '/',
		waitingNextBatch: '⏳ Waiting',
		msBeforeNextBatch: 'ms before next batch...',
	},
};

export const testMessages = {
	directoryCreationFailed: 'Directory creation failed',
	writeOperationFailed: 'Write operation failed',
};
