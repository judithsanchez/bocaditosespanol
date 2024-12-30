import {
	GoogleGenerativeAI,
	HarmBlockThreshold,
	HarmCategory,
	SchemaType,
} from '@google/generative-ai';
import {ISentence, IToken, TokenType, WordType} from '../lib/types';

// TODO: batch requests for multiple sentences
// TODO: delete any censorships
// https://aistudio.google.com/u/0/plan_information
// https://madewithnativebase.com/?utm_source=HomePage&utm_medium=header&utm_campaign=NativeBase_3
// https://ai.google.dev/api/generate-content#v1beta.GenerationConfig
// HARM

console.log('🚀 Initializing AI Text Augmentation');

const genAI = new GoogleGenerativeAI('AIzaSyBmXIsCMkUh3-K_u1rCM5skL0-mIW6yhZY');

console.log('📋 Setting up sentence schema');
const sentenceSchema = {
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

export async function augmentSentence(sentence: ISentence): Promise<ISentence> {
	console.log('\n🎯 Starting sentence augmentation');

	const wordTokens = sentence.tokens.filter(token => token.type === 'word');

	const tempSentence: ISentence = {
		...sentence,
		tokens: wordTokens,
	};

	try {
		console.log('🤖 Sending word tokens to Gemini');
		const prompt = {
			contents: [
				{
					role: 'user',
					parts: [
						{
							text: `Linguistic Analysis Task for Spanish-English Learning:

Input: ${JSON.stringify(tempSentence)}

STRICT PROCESSING RULES:
1. Sentence Translation:
   - Add complete English translation in the "translation" field
   - Keep natural and idiomatic English flow

2. Token Processing:
   - ADD english translation for each word token
   - ADD grammatical type from: ${Object.values(WordType).join(', ')}
   - KEEP all existing properties

3. Response Format:
   - Must follow exact schema structure
   - Must preserve token order

Generate response maintaining exact input structure.`,
						},
					],
				},
			],
		};

		const result = await model.generateContent(prompt);
		const response = await result.response.text();
		// console.log('📤 Gemini response:', response);

		const enrichedData = JSON.parse(response);

		const enrichedTokensMap = new Map(
			enrichedData.tokens.map((token: any) => [token.token.spanish, token]),
		);

		const augmentedTokens = sentence.tokens.map(originalToken => {
			if (originalToken.type !== 'word') {
				return originalToken;
			}

			const spanish = (originalToken.token as any).spanish;
			return enrichedTokensMap.get(spanish) || originalToken;
		});

		const validatedData: ISentence = {
			...enrichedData,
			tokens: augmentedTokens,
		};

		console.log('✨ Processed data:', JSON.stringify(validatedData, null, 2));
		console.log('✅ Sentence augmentation completed\n');

		return validatedData;
	} catch (error) {
		console.error('❌ Error during sentence augmentation:', error);
		throw new Error(`Error augmenting sentence: ${error}`);
	}
}
