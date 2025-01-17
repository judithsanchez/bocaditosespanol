import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {config} from 'dotenv';
import {geminiSafetySettings} from '../lib/constants';
import {
	InterjectionEmotion,
	InterjectionType,
} from '../lib/grammaticalInfo/interjectionsTypes';
import {IWord} from '../lib/types';
import {Logger} from './Logger';
config();

const logger = new Logger('InterjectionEnricher');
const genAI = new GoogleGenerativeAI(
	process.env.GOOGLE_GENERATIVE_AI_KEY ?? '',
);

const interjectionTokenSchema = {
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			tokenId: {type: SchemaType.STRING},
			content: {type: SchemaType.STRING},
			grammaticalInfo: {
				type: SchemaType.OBJECT,
				properties: {
					interjectionEmotion: {
						type: SchemaType.STRING,
						enum: Object.values(InterjectionEmotion),
					},
					interjectionType: {
						type: SchemaType.STRING,
						enum: Object.values(InterjectionType),
					},
				},
				required: ['interjectionEmotion', 'interjectionType'],
			},
		},
		required: ['tokenId', 'content', 'grammaticalInfo'],
	},
};

export async function enrichInterjectionTokens(
	tokens: Pick<IWord, 'tokenId' | 'content' | 'grammaticalInfo'>[],
): Promise<Pick<IWord, 'tokenId' | 'content' | 'grammaticalInfo'>[]> {
	logger.start('enrichInterjectionTokens');
	logger.info('Processing interjection tokens', {count: tokens.length});

	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash',
		generationConfig: {
			responseMimeType: 'application/json',
			responseSchema: interjectionTokenSchema,
		},
		systemInstruction: `
      Spanish Interjection Analysis Task: Analyze each interjection and return the enriched interjection tokens array.
      For each interjection, provide detailed information including:
      - Emotion: Specify the emotion expressed. Possible values: ${Object.values(InterjectionEmotion).join(', ')}
      - Type: Specify the type. Possible values: ${Object.values(InterjectionType).join(', ')}
    `,
		safetySettings: geminiSafetySettings,
	});

	try {
		const prompt = {
			contents: [
				{
					role: 'user',
					parts: [{text: `Input Interjections: ${JSON.stringify(tokens)}`}],
				},
			],
		};

		logger.info('Sending request to AI model');
		const result = await model.generateContent(prompt);
		const response = await result.response.text();

		const enrichedInterjections = JSON.parse(response);
		logger.info('Interjections enriched successfully', {
			inputCount: tokens.length,
			outputCount: enrichedInterjections.length,
		});

		logger.end('enrichInterjectionTokens');
		return enrichedInterjections;
	} catch (error) {
		logger.error('Interjection enrichment failed', error);
		throw error;
	}
}
