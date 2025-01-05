import {
	HarmBlockThreshold,
	HarmCategory,
	SchemaType,
} from '@google/generative-ai';

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

export const geminiSafetySettings = [
	{
		category: HarmCategory.HARM_CATEGORY_HARASSMENT,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
	{
		category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
	{
		category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
	{
		category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
];

export const geminiSentenceSchema = {
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			sentenceId: {type: SchemaType.STRING},
			sentence: {type: SchemaType.STRING},
			translation: {type: SchemaType.STRING},
			literalTranslation: {type: SchemaType.STRING},
			tokens: {
				type: SchemaType.ARRAY,
				items: {
					type: SchemaType.OBJECT,
					properties: {
						content: {
							type: SchemaType.OBJECT,
							properties: {
								wordId: {type: SchemaType.STRING},
								spanish: {type: SchemaType.STRING},
								normalizedToken: {type: SchemaType.STRING},
								english: {type: SchemaType.STRING},
								hasSpecialChar: {type: SchemaType.BOOLEAN},
								partOfSpeech: {type: SchemaType.STRING},
								isSlang: {type: SchemaType.BOOLEAN},
								isCognate: {type: SchemaType.BOOLEAN},
								isFalseCognate: {type: SchemaType.BOOLEAN},
							},
							required: [
								'wordId',
								'spanish',
								'normalizedToken',
								'english',
								'hasSpecialChar',
								'partOfSpeech',
								'isSlang',
								'isCognate',
								'isFalseCognate',
							],
						},
						type: {
							type: SchemaType.STRING,
							enum: ['word', 'punctuationSign', 'emoji'],
						},
					},
					required: ['content', 'type'],
				},
			},
		},
		required: ['sentenceId', 'sentence', 'translation', 'tokens'],
	},
};

export const geminiVerbTokenSchema = {
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			tokenId: {type: SchemaType.STRING},
			content: {
				type: SchemaType.OBJECT,
				properties: {
					wordId: {type: SchemaType.STRING},
					spanish: {type: SchemaType.STRING},
					normalizedToken: {type: SchemaType.STRING},
					partOfSpeech: {type: SchemaType.STRING},
					grammaticalInfo: {
						type: SchemaType.OBJECT,
						properties: {
							tense: {type: SchemaType.STRING},
							mood: {type: SchemaType.STRING},
							person: {type: SchemaType.STRING},
							number: {type: SchemaType.STRING},
							isRegular: {type: SchemaType.BOOLEAN},
							infinitive: {type: SchemaType.STRING},
							conjugationPattern: {type: SchemaType.STRING},
							voice: {type: SchemaType.STRING},
							verbClass: {type: SchemaType.STRING},
							gerund: {type: SchemaType.BOOLEAN},
							pastParticiple: {type: SchemaType.BOOLEAN},
							auxiliary: {type: SchemaType.STRING},
							verbRegularity: {type: SchemaType.STRING},
							isReflexive: {type: SchemaType.BOOLEAN},
						},
						required: [
							'tense',
							'mood',
							'person',
							'number',
							'isRegular',
							'infinitive',
							'conjugationPattern',
							'voice',
							'verbClass',
							'gerund',
							'pastParticiple',
							'auxiliary',
							'verbRegularity',
							'isReflexive',
						],
					},
				},
			},
			type: {type: SchemaType.STRING},
		},
	},
};
