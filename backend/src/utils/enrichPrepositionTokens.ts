import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {config} from 'dotenv';
import {geminiSafetySettings} from '../lib/constants';
import {
	PrepositionType,
	ContractsWith,
} from '../lib/grammaticalInfo/prepositionsTypes';
import {IWord} from '../lib/types';
import {Logger} from './Logger';
config();

const logger = new Logger('PrepositionEnricher');
const genAI = new GoogleGenerativeAI(
	process.env.GOOGLE_GENERATIVE_AI_KEY ?? '',
);

const prepositionTokenSchema = {
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			tokenId: {type: SchemaType.STRING},
			content: {type: SchemaType.STRING},
			grammaticalInfo: {
				type: SchemaType.OBJECT,
				properties: {
					prepositionType: {
						type: SchemaType.STRING,
						enum: Object.values(PrepositionType),
					},
					contractsWith: {
						type: SchemaType.STRING,
						enum: Object.values(ContractsWith),
					},
				},
				required: ['prepositionType', 'contractsWith'],
			},
		},
		required: ['tokenId', 'content', 'grammaticalInfo'],
	},
};

export async function enrichPrepositionTokens(
	tokens: Pick<IWord, 'tokenId' | 'content' | 'grammaticalInfo'>[],
): Promise<Pick<IWord, 'tokenId' | 'content' | 'grammaticalInfo'>[]> {
	logger.start('enrichPrepositionTokens');
	logger.info('Processing preposition tokens', {count: tokens.length});

	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash-8b',
		generationConfig: {
			responseMimeType: 'application/json',
			responseSchema: prepositionTokenSchema,
		},
		systemInstruction: `
      Spanish Preposition Analysis Task: Analyze each preposition and return the enriched preposition tokens array.
      For each preposition, provide detailed information including:
      - Preposition Type: Specify if simple, compound, or locution. Possible values: ${Object.values(PrepositionType).join(', ')}
      - Contracts With: Specify if it contracts with articles or pronouns. Possible values: ${Object.values(ContractsWith).join(', ')}
    `,
		safetySettings: geminiSafetySettings,
	});

	try {
		const prompt = {
			contents: [
				{
					role: 'user',
					parts: [{text: `Input Prepositions: ${JSON.stringify(tokens)}`}],
				},
			],
		};

		logger.info('Sending request to AI model');
		const result = await model.generateContent(prompt);
		const response = await result.response.text();

		const enrichedPrepositions = JSON.parse(response);
		logger.info('Prepositions enriched successfully', {
			inputCount: tokens.length,
			outputCount: enrichedPrepositions.length,
		});

		logger.end('enrichPrepositionTokens');
		return enrichedPrepositions;
	} catch (error) {
		logger.error('Preposition enrichment failed', error);
		throw error;
	}
}
