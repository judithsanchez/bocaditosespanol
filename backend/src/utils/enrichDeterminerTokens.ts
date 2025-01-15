import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {config} from 'dotenv';
import {geminiSafetySettings} from '../lib/constants';
import {DeterminerType} from '../lib/grammaticalInfo/determinersTypes';
import {GrammaticalGender, GrammaticalNumber, IWord} from '../lib/types';
import {Logger} from './Logger';
config();

const logger = new Logger('DeterminerEnricher');
const genAI = new GoogleGenerativeAI(
	process.env.GOOGLE_GENERATIVE_AI_KEY ?? '',
);

const determinerTokenSchema = {
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			tokenId: {type: SchemaType.STRING},
			originalText: {type: SchemaType.STRING},
			grammaticalInfo: {
				type: SchemaType.OBJECT,
				properties: {
					determinerType: {
						type: SchemaType.STRING,
						enum: Object.values(DeterminerType),
					},
					gender: {
						type: SchemaType.STRING,
						enum: Object.values(GrammaticalGender),
					},
					number: {
						type: SchemaType.STRING,
						enum: Object.values(GrammaticalNumber),
					},
				},
				required: ['determinerType', 'gender', 'number'],
			},
		},
		required: ['tokenId', 'originalText', 'grammaticalInfo'],
	},
};

export async function enrichDeterminerTokens(
	tokens: Pick<IWord, 'tokenId' | 'originalText' | 'grammaticalInfo'>[],
): Promise<Pick<IWord, 'tokenId' | 'originalText' | 'grammaticalInfo'>[]> {
	logger.start('enrichDeterminerTokens');
	logger.info('Processing determiner tokens', {count: tokens.length});

	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash',
		generationConfig: {
			responseMimeType: 'application/json',
			responseSchema: determinerTokenSchema,
		},
		systemInstruction: `
      Spanish Determiner Analysis Task: Analyze each determiner and return the enriched determiner tokens array.
      For each determiner, provide detailed grammatical information including:
      - Determiner Type: Specify the type. Possible values: ${Object.values(DeterminerType).join(', ')}
      - Gender: Specify grammatical gender. Possible values: ${Object.values(GrammaticalGender).join(', ')}
      - Number: Specify if singular or plural. Possible values: ${Object.values(GrammaticalNumber).join(', ')}
    `,
		safetySettings: geminiSafetySettings,
	});

	try {
		const prompt = {
			contents: [
				{
					role: 'user',
					parts: [{text: `Input Determiners: ${JSON.stringify(tokens)}`}],
				},
			],
		};

		logger.info('Sending request to AI model');
		const result = await model.generateContent(prompt);
		const response = await result.response.text();

		const enrichedDeterminers = JSON.parse(response);
		logger.info('Determiners enriched successfully', {
			inputCount: tokens.length,
			outputCount: enrichedDeterminers.length,
		});

		logger.end('enrichDeterminerTokens');
		return enrichedDeterminers;
	} catch (error) {
		logger.error('Determiner enrichment failed', error);
		throw error;
	}
}
