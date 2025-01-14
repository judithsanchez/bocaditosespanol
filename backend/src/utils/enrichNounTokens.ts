import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {config} from 'dotenv';
import {geminiSafetySettings} from '../lib/constants';
import {GrammaticalGender, GrammaticalNumber, IWord} from '../lib/types';
import {Logger} from './Logger';
config();

const logger = new Logger('NounEnricher');

const genAI = new GoogleGenerativeAI(
	process.env.GOOGLE_GENERATIVE_AI_KEY ?? '',
);

export const nounTokenSchema = {
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			tokenId: {type: SchemaType.STRING},
			originalText: {type: SchemaType.STRING},
			grammaticalInfo: {
				type: SchemaType.OBJECT,
				properties: {
					gender: {
						type: SchemaType.STRING,
						enum: Object.values(GrammaticalGender),
					},
					number: {
						type: SchemaType.STRING,
						enum: Object.values(GrammaticalNumber),
					},
					isProperNoun: {type: SchemaType.BOOLEAN},
					diminutive: {type: SchemaType.BOOLEAN},
				},
				required: ['gender', 'number', 'isProperNoun', 'diminutive'],
			},
		},
		required: ['tokenId', 'originalText', 'grammaticalInfo'],
	},
};

export async function enrichNounTokens(
	tokens: Pick<IWord, 'tokenId' | 'originalText' | 'grammaticalInfo'>[],
): Promise<Pick<IWord, 'tokenId' | 'originalText' | 'grammaticalInfo'>[]> {
	logger.start('enrichNounTokens');
	logger.info('Processing noun tokens', {count: tokens.length});

	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash',
		generationConfig: {
			responseMimeType: 'application/json',
			responseSchema: nounTokenSchema,
		},
		systemInstruction: `
            Spanish Noun Analysis Task: Analyze each noun and return the enriched noun tokens array.
            For each noun, provide detailed grammatical information including:
            - Gender: Specify grammatical gender. Possible values: ${Object.values(
							GrammaticalGender,
						).join(', ')}
            - Number: Specify if singular or plural. Possible values: ${Object.values(
							GrammaticalNumber,
						).join(', ')}
            - Proper Noun: Indicate if it's a proper noun
            - Diminutive: Indicate if it's a diminutive form
            Consider all possible interpretations for ambiguous cases.
        `,
		safetySettings: geminiSafetySettings,
	});

	try {
		const prompt = {
			contents: [
				{
					role: 'user',
					parts: [
						{
							text: `Input Nouns: ${JSON.stringify(tokens)}`,
						},
					],
				},
			],
		};

		logger.info('Sending request to AI model');
		const result = await model.generateContent(prompt);
		const response = await result.response.text();

		const enrichedNouns = JSON.parse(response);
		logger.info('Nouns enriched successfully', {
			inputCount: tokens.length,
			outputCount: enrichedNouns.length,
		});

		logger.end('enrichNounTokens');
		return enrichedNouns;
	} catch (error) {
		logger.error('Noun enrichment failed', error);
		throw error;
	}
}
