import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {config} from 'dotenv';
import {geminiSafetySettings} from '../lib/constants';
import {AdverbType} from '../lib/grammaticalInfo/adverbsTypes';
import {IWord} from '../lib/types';
import {Logger} from './Logger';
config();

const logger = new Logger('AdverbEnricher');
const genAI = new GoogleGenerativeAI(
	process.env.GOOGLE_GENERATIVE_AI_KEY ?? '',
);

const adverbTokenSchema = {
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			tokenId: {type: SchemaType.STRING},
			originalText: {type: SchemaType.STRING},
			grammaticalInfo: {
				type: SchemaType.OBJECT,
				properties: {
					adverbType: {
						type: SchemaType.STRING,
						enum: Object.values(AdverbType),
					},
					usesMente: {type: SchemaType.BOOLEAN},
				},
				required: ['adverbType', 'usesMente'],
			},
		},
		required: ['tokenId', 'originalText', 'grammaticalInfo'],
	},
};

export async function enrichAdverbTokens(
	tokens: Pick<IWord, 'tokenId' | 'originalText' | 'grammaticalInfo'>[],
): Promise<Pick<IWord, 'tokenId' | 'originalText' | 'grammaticalInfo'>[]> {
	logger.start('enrichAdverbTokens');
	logger.info('Processing adverb tokens', {count: tokens.length});

	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash',
		generationConfig: {
			responseMimeType: 'application/json',
			responseSchema: adverbTokenSchema,
		},
		systemInstruction: `
      Spanish Adverb Analysis Task: Analyze each adverb and return the enriched adverb tokens array.
      For each adverb, provide detailed grammatical information including:
      - Adverb Type: Specify the type. Possible values: ${Object.values(AdverbType).join(', ')}
      - Mente Usage: Indicate if it ends in -mente
      Consider context and all possible interpretations for ambiguous cases.
    `,
		safetySettings: geminiSafetySettings,
	});

	try {
		const prompt = {
			contents: [
				{
					role: 'user',
					parts: [{text: `Input Adverbs: ${JSON.stringify(tokens)}`}],
				},
			],
		};

		logger.info('Sending request to AI model');
		const result = await model.generateContent(prompt);
		const response = await result.response.text();

		const enrichedAdverbs = JSON.parse(response);
		logger.info('Adverbs enriched successfully', {
			inputCount: tokens.length,
			outputCount: enrichedAdverbs.length,
		});

		logger.end('enrichAdverbTokens');
		return enrichedAdverbs;
	} catch (error) {
		logger.error('Adverb enrichment failed', error);
		throw error;
	}
}
