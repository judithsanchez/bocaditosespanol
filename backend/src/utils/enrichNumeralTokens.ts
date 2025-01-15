import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {config} from 'dotenv';
import {geminiSafetySettings} from '../lib/constants';
import {NumeralType} from '../lib/grammaticalInfo/numeralsTypes';
import {GrammaticalGender, GrammaticalNumber, IWord} from '../lib/types';
import {Logger} from './Logger';
config();

const logger = new Logger('NumeralEnricher');
const genAI = new GoogleGenerativeAI(
	process.env.GOOGLE_GENERATIVE_AI_KEY ?? '',
);

const numeralTokenSchema = {
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			tokenId: {type: SchemaType.STRING},
			originalText: {type: SchemaType.STRING},
			grammaticalInfo: {
				type: SchemaType.OBJECT,
				properties: {
					numeralType: {
						type: SchemaType.STRING,
						enum: Object.values(NumeralType),
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
				required: ['numeralType', 'gender', 'number'],
			},
		},
		required: ['tokenId', 'originalText', 'grammaticalInfo'],
	},
};

export async function enrichNumeralTokens(
	tokens: Pick<IWord, 'tokenId' | 'originalText' | 'grammaticalInfo'>[],
): Promise<Pick<IWord, 'tokenId' | 'originalText' | 'grammaticalInfo'>[]> {
	logger.start('enrichNumeralTokens');
	logger.info('Processing numeral tokens', {count: tokens.length});

	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash',
		generationConfig: {
			responseMimeType: 'application/json',
			responseSchema: numeralTokenSchema,
		},
		systemInstruction: `
      Spanish Numeral Analysis Task: Analyze each numeral and return the enriched numeral tokens array.
      For each numeral, provide detailed information including:
      - Numeral Type: Specify the type. Possible values: ${Object.values(NumeralType).join(', ')}
      - Gender: Specify grammatical gender if applicable. Possible values: ${Object.values(GrammaticalGender).join(', ')}
      - Number: Specify if singular or plural if applicable. Possible values: ${Object.values(GrammaticalNumber).join(', ')}
    `,
		safetySettings: geminiSafetySettings,
	});

	try {
		const prompt = {
			contents: [
				{
					role: 'user',
					parts: [{text: `Input Numerals: ${JSON.stringify(tokens)}`}],
				},
			],
		};

		logger.info('Sending request to AI model');
		const result = await model.generateContent(prompt);
		const response = await result.response.text();

		const enrichedNumerals = JSON.parse(response);
		logger.info('Numerals enriched successfully', {
			inputCount: tokens.length,
			outputCount: enrichedNumerals.length,
		});

		logger.end('enrichNumeralTokens');
		return enrichedNumerals;
	} catch (error) {
		logger.error('Numeral enrichment failed', error);
		throw error;
	}
}
