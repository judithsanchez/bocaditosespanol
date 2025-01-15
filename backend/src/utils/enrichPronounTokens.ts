import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {config} from 'dotenv';
import {geminiSafetySettings} from '../lib/constants';
import {PronounType, PronounCase} from '../lib/grammaticalInfo/pronounsTypes';
import {
	GrammaticalGender,
	GrammaticalNumber,
	GrammaticalPerson,
	IWord,
} from '../lib/types';
import {Logger} from './Logger';
config();

const logger = new Logger('PronounEnricher');
const genAI = new GoogleGenerativeAI(
	process.env.GOOGLE_GENERATIVE_AI_KEY ?? '',
);

const pronounTokenSchema = {
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			tokenId: {type: SchemaType.STRING},
			originalText: {type: SchemaType.STRING},
			grammaticalInfo: {
				type: SchemaType.OBJECT,
				properties: {
					pronounType: {
						type: SchemaType.STRING,
						enum: Object.values(PronounType),
					},
					person: {
						type: SchemaType.STRING,
						enum: Object.values(GrammaticalPerson),
					},
					gender: {
						type: SchemaType.STRING,
						enum: Object.values(GrammaticalGender),
					},
					number: {
						type: SchemaType.STRING,
						enum: Object.values(GrammaticalNumber),
					},
					case: {
						type: SchemaType.STRING,
						enum: Object.values(PronounCase),
					},
					isReflexive: {type: SchemaType.BOOLEAN},
					isReciprocal: {type: SchemaType.BOOLEAN},
				},
				required: [
					'pronounType',
					'person',
					'gender',
					'number',
					'case',
					'isReflexive',
					'isReciprocal',
				],
			},
		},
		required: ['tokenId', 'originalText', 'grammaticalInfo'],
	},
};

export async function enrichPronounTokens(
	tokens: Pick<IWord, 'tokenId' | 'originalText' | 'grammaticalInfo'>[],
): Promise<Pick<IWord, 'tokenId' | 'originalText' | 'grammaticalInfo'>[]> {
	logger.start('enrichPronounTokens');
	logger.info('Processing pronoun tokens', {count: tokens.length});

	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash',
		generationConfig: {
			responseMimeType: 'application/json',
			responseSchema: pronounTokenSchema,
		},
		systemInstruction: `
      Spanish Pronoun Analysis Task: Analyze each pronoun and return the enriched pronoun tokens array.
      For each pronoun, provide detailed information including:
      - Pronoun Type: Specify the type. Possible values: ${Object.values(PronounType).join(', ')}
      - Person: Specify grammatical person. Possible values: ${Object.values(GrammaticalPerson).join(', ')}
      - Gender: Specify grammatical gender. Possible values: ${Object.values(GrammaticalGender).join(', ')}
      - Number: Specify if singular or plural. Possible values: ${Object.values(GrammaticalNumber).join(', ')}
      - Case: Specify the case. Possible values: ${Object.values(PronounCase).join(', ')}
      - Reflexive: Indicate if it's reflexive
      - Reciprocal: Indicate if it's reciprocal
    `,
		safetySettings: geminiSafetySettings,
	});

	try {
		const prompt = {
			contents: [
				{
					role: 'user',
					parts: [{text: `Input Pronouns: ${JSON.stringify(tokens)}`}],
				},
			],
		};

		logger.info('Sending request to AI model');
		const result = await model.generateContent(prompt);
		const response = await result.response.text();

		const enrichedPronouns = JSON.parse(response);
		logger.info('Pronouns enriched successfully', {
			inputCount: tokens.length,
			outputCount: enrichedPronouns.length,
		});

		logger.end('enrichPronounTokens');
		return enrichedPronouns;
	} catch (error) {
		logger.error('Pronoun enrichment failed', error);
		throw error;
	}
}
