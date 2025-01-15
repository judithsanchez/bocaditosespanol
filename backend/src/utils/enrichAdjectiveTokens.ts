import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {config} from 'dotenv';
import {geminiSafetySettings} from '../lib/constants';
import {GrammaticalGender, GrammaticalNumber, IWord} from '../lib/types';
import {Logger} from './Logger';
config();

const logger = new Logger('AdjectiveEnricher');
const genAI = new GoogleGenerativeAI(
	process.env.GOOGLE_GENERATIVE_AI_KEY ?? '',
);

const adjectiveTokenSchema = {
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
					isPastParticiple: {type: SchemaType.BOOLEAN},
				},
				required: ['gender', 'number', 'isPastParticiple'],
			},
		},
		required: ['tokenId', 'originalText', 'grammaticalInfo'],
	},
};

export async function enrichAdjectiveTokens(
	tokens: Pick<IWord, 'tokenId' | 'originalText' | 'grammaticalInfo'>[],
): Promise<Pick<IWord, 'tokenId' | 'originalText' | 'grammaticalInfo'>[]> {
	logger.start('enrichAdjectiveTokens');
	logger.info('Processing adjective tokens', {count: tokens.length});

	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash',
		generationConfig: {
			responseMimeType: 'application/json',
			responseSchema: adjectiveTokenSchema,
		},
		systemInstruction: `
      Spanish Adjective Analysis Task: Analyze each adjective and return the enriched adjective tokens array.
      For each adjective, provide detailed grammatical information including:
      - Gender: Specify grammatical gender. Possible values: ${Object.values(GrammaticalGender).join(', ')}
      - Number: Specify if singular or plural. Possible values: ${Object.values(GrammaticalNumber).join(', ')}
      - Past Participle: Indicate if it's being used as a past participle
      Consider context and all possible interpretations for ambiguous cases.
    `,
		safetySettings: geminiSafetySettings,
	});

	try {
		const prompt = {
			contents: [
				{
					role: 'user',
					parts: [{text: `Input Adjectives: ${JSON.stringify(tokens)}`}],
				},
			],
		};

		logger.info('Sending request to AI model');
		const result = await model.generateContent(prompt);
		const response = await result.response.text();

		const enrichedAdjectives = JSON.parse(response);
		logger.info('Adjectives enriched successfully', {
			inputCount: tokens.length,
			outputCount: enrichedAdjectives.length,
		});

		logger.end('enrichAdjectiveTokens');
		return enrichedAdjectives;
	} catch (error) {
		logger.error('Adjective enrichment failed', error);
		throw error;
	}
}
