import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {config} from 'dotenv';
import {geminiSafetySettings} from '../lib/constants';
import {
	ConjunctionType,
	ConjunctionFunction,
} from '../lib/grammaticalInfo/conjunctionsTypes';
import {IWord} from '../lib/types';
import {Logger} from './Logger';
config();

const logger = new Logger('ConjunctionEnricher');
const genAI = new GoogleGenerativeAI(
	process.env.GOOGLE_GENERATIVE_AI_KEY ?? '',
);

const conjunctionTokenSchema = {
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			tokenId: {type: SchemaType.STRING},
			content: {type: SchemaType.STRING},
			grammaticalInfo: {
				type: SchemaType.OBJECT,
				properties: {
					conjunctionType: {
						type: SchemaType.STRING,
						enum: Object.values(ConjunctionType),
					},
					conjunctionFunction: {
						type: SchemaType.STRING,
						enum: Object.values(ConjunctionFunction),
					},
				},
				required: ['conjunctionType', 'conjunctionFunction'],
			},
		},
		required: ['tokenId', 'content', 'grammaticalInfo'],
	},
};

export async function enrichConjunctionTokens(
	tokens: Pick<IWord, 'tokenId' | 'content' | 'grammaticalInfo'>[],
): Promise<Pick<IWord, 'tokenId' | 'content' | 'grammaticalInfo'>[]> {
	logger.start('enrichConjunctionTokens');
	logger.info('Processing conjunction tokens', {count: tokens.length});

	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash',
		generationConfig: {
			responseMimeType: 'application/json',
			responseSchema: conjunctionTokenSchema,
		},
		systemInstruction: `
      Spanish Conjunction Analysis Task: Analyze each conjunction and return the enriched conjunction tokens array.
      For each conjunction, provide detailed grammatical information including:
      - Conjunction Type: Specify if coordinating or subordinating. Possible values: ${Object.values(ConjunctionType).join(', ')}
      - Conjunction Function: Specify the function. Possible values: ${Object.values(ConjunctionFunction).join(', ')}
      Consider context and all possible interpretations for ambiguous cases.
    `,
		safetySettings: geminiSafetySettings,
	});

	try {
		const prompt = {
			contents: [
				{
					role: 'user',
					parts: [{text: `Input Conjunctions: ${JSON.stringify(tokens)}`}],
				},
			],
		};

		logger.info('Sending request to AI model');
		const result = await model.generateContent(prompt);
		const response = await result.response.text();

		const enrichedConjunctions = JSON.parse(response);
		logger.info('Conjunctions enriched successfully', {
			inputCount: tokens.length,
			outputCount: enrichedConjunctions.length,
		});

		logger.end('enrichConjunctionTokens');
		return enrichedConjunctions;
	} catch (error) {
		logger.error('Conjunction enrichment failed', error);
		throw error;
	}
}
