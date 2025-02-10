import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {config} from 'dotenv';
import {errors, geminiSafetySettings} from '../lib/constants';
import {Logger} from './Logger';
import {ISentence} from 'lib/types';
config();

const logger = new Logger('SentenceEnricher');

const genAI = new GoogleGenerativeAI(
	process.env.GOOGLE_GENERATIVE_AI_KEY ?? '',
);

const sentenceSchema = {
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			sentenceId: {type: SchemaType.STRING},
			content: {type: SchemaType.STRING},
			translations: {
				type: SchemaType.OBJECT,
				properties: {
					english: {
						type: SchemaType.OBJECT,
						properties: {
							literal: {type: SchemaType.STRING},
							contextual: {type: SchemaType.STRING},
						},
						required: ['literal', 'contextual'],
					},
				},
				required: ['english'],
			},
			tokenIds: {
				type: SchemaType.ARRAY,
				items: {type: SchemaType.STRING},
			},
		},
		required: ['sentenceId', 'content', 'translations', 'tokenIds'],
	},
};
const model = genAI.getGenerativeModel({
	model: 'gemini-2.0-flash-exp',
	generationConfig: {
		responseMimeType: 'application/json',
		responseSchema: sentenceSchema,
	},
	safetySettings: geminiSafetySettings,
});

export async function enrichSentencesWithAI(
	sentences: ISentence[],
	metadata: {
		interpreter: string;
		language: {
			main: string;
			variant: string[];
		};
	},
): Promise<ISentence[]> {
	logger.start('enrichSentencesWithAI');
	logger.info('Starting AI enrichment pipeline', {
		sentenceCount: sentences.length,
		firstSentence: sentences[0]?.content || 'No sentences provided',
	});

	try {
		logger.info('Configuring AI request');
		const prompt = {
			contents: [
				{
					role: 'user',
					parts: [
						{
							text: `Linguistic Analysis Task for Spanish-English Learning:

Context Information:
- Artist/Interpreter: ${metadata.interpreter}
- Main Language: ${metadata.language.main}
- Language Variants/Dialects: ${metadata.language.variant.join(', ')}

Input Array: ${JSON.stringify(sentences)}

CRITICAL REQUIREMENTS:
1. MUST return an ARRAY with EXACTLY ${sentences.length} processed sentences
2. Each sentence must maintain its original position in the array
3. Process ALL sentences
4. Consider the artist's dialect and language variants in translations

STRICT PROCESSING RULES:
1. OUTPUT MUST BE AN ARRAY of processed sentences
2. For EACH sentence in the array:
      - ADD complete English contextual translation considering ${metadata.interpreter}'s ${metadata.language.main} dialect
      - ADD literal word-for-word translation that maintains ${metadata.language.main} grammar structure but still makes sense in context
            Example: "Yo tengo hambre" → "I have hunger"
            Example: "Me gusta bailar" → "To me pleases to dance"
      - KEEP all other existing properties untouched

3. Response Format:
      - Must be an array matching input length
      - Must follow exact schema structure
      - Must preserve sentence order

Generate response as an array of fully processed sentences.`,
						},
					],
				},
			],
		};

		logger.info('Sending request to Gemini');
		const result = await model.generateContent(prompt);
		const response = await result.response.text();

		logger.info('Processing AI response', {
			responseLength: response.length,
		});

		if (!response) {
			logger.error(
				'Empty AI response',
				new Error(errors.aiProcessing.emptyResponse),
			);
			throw new Error(errors.aiProcessing.emptyResponse);
		}

		const enrichedSentences = JSON.parse(response);
		logger.info('Enrichment completed', {
			inputCount: sentences.length,
			outputCount: enrichedSentences.length,
			samplesProcessed: enrichedSentences.map((s: ISentence) => ({
				id: s.sentenceId,
				hasTranslation: !!s.translations.english.contextual,
				hasLiteralTranslation: !!s.translations.english.literal,
			})),
		});

		logger.end('enrichSentencesWithAI');
		return enrichedSentences;
	} catch (error) {
		logger.error('AI processing failed', error);
		throw error;
	}
}
