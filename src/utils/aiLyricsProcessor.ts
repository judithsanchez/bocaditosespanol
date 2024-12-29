import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {ISentence, IToken, TokenType, WordType} from '../lib/types';

console.log('🚀 Initializing AI Lyrics Processor');

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
						enum: ['word', 'emoji', 'punctuationSign'],
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
});

export async function augmentSentence(sentence: ISentence): Promise<ISentence> {
	console.log('\n🎯 Starting sentence augmentation');
	console.log('📥 Input sentence:', JSON.stringify(sentence, null, 2));

	try {
		console.log('🤖 Sending prompt to Gemini');
		const prompt = {
			contents: [
				{
					role: 'user',
					parts: [
						{
							text: `Linguistic Analysis Task for Spanish-English Learning:

      Input: ${JSON.stringify(sentence)}

      Required Analysis:
      1. Sentence Level:
         - Provide idiomatic English translation
         - Maintain contextual meaning and cultural nuances
      
      2. Token Level Analysis:
         - Word-by-word English translations
         - Grammatical classification using: ${Object.values(WordType).join(
						', ',
					)}
         - Special character detection
         - Normalized form processing
      
      3. Technical Requirements:
         - Maintain JSON structure per schema
         - Preserve punctuation tokens as type: 'punctuationSign'
         - Process word tokens as type: 'word'
         
      4. Educational Context:
         - Focus on accuracy for language learning
         - Maintain natural language flow
         - Capture idiomatic expressions

      Generate response following the exact schema structure.`,
						},
					],
				},
			],
		};

		const result = await model.generateContent(prompt);
		const response = await result.response.text();
		console.log('📤 Gemini response:', response);

		const enrichedData = JSON.parse(response);

		// Validate and ensure correct token types
		const validatedData: ISentence = {
			...enrichedData,
			tokens: enrichedData.tokens.map((token: any) => ({
				...token,
				type: token.type as TokenType,
			})),
		};

		console.log('✨ Processed data:', JSON.stringify(validatedData, null, 2));

		console.log('✅ Sentence augmentation completed\n');
		return validatedData;
	} catch (error) {
		console.error('❌ Error during sentence augmentation:', error);
		throw new Error(`Error augmenting sentence: ${error}`);
	}
}
