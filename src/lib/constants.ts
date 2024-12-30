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

export const urls = {
	local: 'http://localhost:3000/',
	songs: 'http://localhost:3000/songs',
};
