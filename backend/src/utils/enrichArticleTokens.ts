import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {config} from 'dotenv';
import {geminiSafetySettings} from '../lib/constants';
import {ArticleType} from '../lib/grammaticalInfo/articlesTypes';
import {GrammaticalGender, GrammaticalNumber, IWord} from '../lib/types';
import {Logger} from './Logger';
config();

const logger = new Logger('ArticleEnricher');
const genAI = new GoogleGenerativeAI(
	process.env.GOOGLE_GENERATIVE_AI_KEY ?? '',
);

const articleTokenSchema = {
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			tokenId: {type: SchemaType.STRING},
			content: {type: SchemaType.STRING},
			grammaticalInfo: {
				type: SchemaType.OBJECT,
				properties: {
					articleType: {
						type: SchemaType.STRING,
						enum: Object.values(ArticleType),
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
				required: ['articleType', 'gender', 'number'],
			},
		},
		required: ['tokenId', 'content', 'grammaticalInfo'],
	},
};

export async function enrichArticleTokens(
	tokens: Pick<IWord, 'tokenId' | 'content' | 'grammaticalInfo'>[],
): Promise<Pick<IWord, 'tokenId' | 'content' | 'grammaticalInfo'>[]> {
	logger.start('enrichArticleTokens');
	logger.info('Processing article tokens', {count: tokens.length});

	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash-8b',
		generationConfig: {
			responseMimeType: 'application/json',
			responseSchema: articleTokenSchema,
		},
		systemInstruction: `
      Spanish Article Analysis Task: Analyze each article and return the enriched article tokens array.
      For each article, provide detailed grammatical information including:
      - Article Type: Specify if definite or indefinite. Possible values: ${Object.values(ArticleType).join(', ')}
      - Gender: Specify grammatical gender. Possible values: ${Object.values(GrammaticalGender).join(', ')}
      - Number: Specify if singular or plural. Possible values: ${Object.values(GrammaticalNumber).join(', ')}
      Consider context and all possible interpretations for ambiguous cases.
    `,
		safetySettings: geminiSafetySettings,
	});

	try {
		const prompt = {
			contents: [
				{
					role: 'user',
					parts: [{text: `Input Articles: ${JSON.stringify(tokens)}`}],
				},
			],
		};

		logger.info('Sending request to AI model');
		const result = await model.generateContent(prompt);
		const response = await result.response.text();

		const enrichedArticles = JSON.parse(response);
		logger.info('Articles enriched successfully', {
			inputCount: tokens.length,
			outputCount: enrichedArticles.length,
		});

		logger.end('enrichArticleTokens');
		return enrichedArticles;
	} catch (error) {
		logger.error('Article enrichment failed', error);
		throw error;
	}
}
