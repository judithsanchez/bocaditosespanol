import {
	GoogleGenerativeAI,
	HarmBlockThreshold,
	HarmCategory,
	SchemaType,
} from '@google/generative-ai';
import {ISentence, IToken, TokenType, WordType} from '../lib/types';

console.log('🚀 Initializing AI Lyrics Processor');

const genAI = new GoogleGenerativeAI('AIzaSyBmXIsCMkUh3-K_u1rCM5skL0-mIW6yhZY');

console.log('📋 Setting up sentence schema');
const sentenceSchema = {
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			sentence: {type: SchemaType.STRING},
			translation: {type: SchemaType.STRING},
			tokens: {
				type: SchemaType.ARRAY,
				items: {
					type: SchemaType.OBJECT,
					properties: {
						token: {
							type: SchemaType.OBJECT,
							properties: {
								spanish: {type: SchemaType.STRING},
								normalizedToken: {type: SchemaType.STRING},
								english: {type: SchemaType.STRING},
								hasSpecialChar: {type: SchemaType.BOOLEAN},
								wordType: {type: SchemaType.STRING},
							},
							required: ['spanish', 'normalizedToken', 'hasSpecialChar'],
						},
						type: {
							type: SchemaType.STRING,
							enum: ['word'],
						},
					},
					required: ['token', 'type'],
				},
			},
		},
		required: ['sentence', 'translation', 'tokens'],
	},
};
console.log('⚙️ Configuring Gemini model');
const model = genAI.getGenerativeModel({
	model: 'gemini-1.5-flash',
	generationConfig: {
		responseMimeType: 'application/json',
		responseSchema: sentenceSchema,
	},
	safetySettings: [
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
	],
});

export async function augmentSentences(
	sentences: ISentence[],
): Promise<ISentence[]> {
	console.log('\n🎯 Starting batch sentence augmentation');
	console.log(`Processing batch of ${sentences.length} sentences`);

	try {
		const prompt = {
			contents: [
				{
					role: 'user',
					parts: [
						{
							text: `Linguistic Analysis Task for Spanish-English Learning:

Input Array: ${JSON.stringify(sentences)}

STRICT PROCESSING RULES:
1. OUTPUT MUST BE AN ARRAY of processed sentences
2. For EACH sentence in the array:
      - Add complete English translation
      - ADD english translation for each word token
      - ADD grammatical type from: ${Object.values(WordType).join(', ')}
      - KEEP all existing properties and punctuation tokens
3. Response Format:
      - Must be an array matching input length
      - Must follow exact schema structure
      - Must preserve sentence and token order
      - Must maintain all existing token properties

Generate response as an array of fully processed sentences.`,
						},
					],
				},
			],
		};

		const result = await model.generateContent(prompt);
		const response = await result.response.text();
		console.log('📤 Gemini response:', response);
		let enrichedBatch = JSON.parse(response);
		if (!Array.isArray(enrichedBatch)) {
			console.log('Converting single response to array');
			enrichedBatch = [enrichedBatch];
		}
		console.log(
			'🔍 Parsed data type:',
			typeof enrichedBatch,
			Array.isArray(enrichedBatch),
		);
		// Preserve punctuation tokens for each sentence
		const processedSentences = enrichedBatch.map(
			(enrichedSentence: ISentence, index: number) => {
				const originalSentence = sentences[index];

				// Create map of enriched word tokens
				const enrichedTokensMap = new Map(
					enrichedSentence.tokens.map((token: any) => [
						token.token.spanish,
						token,
					]),
				);

				// Merge enriched tokens while preserving punctuation
				const mergedTokens = originalSentence.tokens.map(originalToken => {
					if (originalToken.type !== 'word') {
						return originalToken;
					}
					const spanish = (originalToken.token as any).spanish;
					return enrichedTokensMap.get(spanish) || originalToken;
				});

				return {
					...enrichedSentence,
					tokens: mergedTokens,
				};
			},
		);

		console.log('✅ Batch processing completed\n');
		return processedSentences;
	} catch (error) {
		console.error('❌ Error during batch processing:', error);
		throw new Error(`Error processing batch: ${error}`);
	}
}
