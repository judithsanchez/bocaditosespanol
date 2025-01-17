import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {config} from 'dotenv';
import {IWord, PartOfSpeech, TokenType} from '../lib/types';
import {geminiSafetySettings} from '../lib/constants';
import {Logger} from './Logger';
config();

// TODO: check why isFalseCognate is sometimes not present

const logger = new Logger('WordEnricher');

const genAI = new GoogleGenerativeAI(
	process.env.GOOGLE_GENERATIVE_AI_KEY ?? '',
);

const wordSchema = {
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			tokenId: {type: SchemaType.STRING},
			tokenType: {type: SchemaType.STRING, enum: [TokenType.Word]},
			content: {type: SchemaType.STRING},
			normalizedToken: {type: SchemaType.STRING},
			translations: {
				type: SchemaType.OBJECT,
				properties: {
					english: {
						type: SchemaType.ARRAY,
						items: {type: SchemaType.STRING},
					},
				},
			},
			hasSpecialChar: {type: SchemaType.BOOLEAN},
			partOfSpeech: {type: SchemaType.STRING},
			isSlang: {type: SchemaType.BOOLEAN},
			isCognate: {type: SchemaType.BOOLEAN},
			isFalseCognate: {type: SchemaType.BOOLEAN},
		},
		required: [
			'tokenId',
			'tokenType',
			'content',
			'normalizedToken',
			'translations',
			'hasSpecialChar',
			'partOfSpeech',
			'isSlang',
			'isCognate',
			'isFalseCognate',
		],
	},
};

export async function enrichWordTokens(words: IWord[]): Promise<IWord[]> {
	logger.start('enrichWordTokens');
	logger.info('Word enrichment pipeline started', {
		wordCount: words.length,
		firstWord: words[0]?.content || 'No words provided',
	});

	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash',
		generationConfig: {
			responseMimeType: 'application/json',
			responseSchema: wordSchema,
		},
		safetySettings: geminiSafetySettings,
		systemInstruction:
			'Spanish Analysis Task: analyze each of the words and enrich them',
	});

	const prompt = {
		contents: [
			{
				role: 'user',
				parts: [
					{
						text: `Spanish Word Analysis Task:

Input Array: ${JSON.stringify(words)}

REQUIREMENTS:
1. Return array with EXACTLY ${words.length} processed words
2. For EACH word provide:
   - Include all possible accurate translations. 
   - For verbs do not include the pronouns.
     Examples:
	 * "estaba" -> ["was", "used to be"]
     * "las" -> ["the"]
     * "taxi" -> ["taxi", "cab"]
     * "era" -> ["was", "used to be"] 
     * "ella" -> ["she", "her"]
     * "de" -> ["of", "from", "about"]

    - Part of speech from allowed values: ${Object.values(PartOfSpeech).join(
			', ',
		)}
    - Boolean flags for: isSlang, isCognate, isFalseCognate

4. COGNATE ANALYSIS RULES:
    - Mark isCognate=true if the word meets ALL the following criteria:
      * Similar spelling: Shares a significant number of letters and phonetic patterns
        - Example threshold: ≥75% character overlap
      * Similar meaning: Matches primary dictionary definitions in both languages
      * Examples: doctor/doctor, animal/animal, idea/idea, familia/family, biology/biología
      * **Context-sensitive validation required**: Exclude cases where meanings diverge in specific contexts.
	  
    - Mark isFalseCognate=true if the word meets ALL the following criteria:
      * Similar spelling or phonetics: Shares a significant number of letters or phonetic similarity
        - Example threshold: ≥75% character overlap
      * **Different meaning**: English and Spanish meanings must differ significantly in core usage.
      * Examples: embarazada(pregnant)/embarrassed, actual(current)/actual, carpeta(folder)/carpet
      * Both flags cannot be true simultaneously.
    - Cognates and false cognates must be mutually exclusive:
      * If meaning matches, isCognate=true and isFalseCognate=false
      * If meaning diverges significantly, isCognate=false and isFalseCognate=true

5. CONTEXTUAL ANALYSIS:
    - Use formal dictionary definitions as the baseline for translation and meaning comparison.
    - Adjust for regional variations and informal or colloquial use where flagged (e.g., slang).
    - Resolve ambiguities using both linguistic context and common usage.

Process ALL words maintaining schema structure.
`,
					},
				],
			},
		],
	};

	try {
		logger.info('Sending request to AI model');

		const result = await model.generateContent(prompt);
		const response = await result.response.text();

		if (!response) {
			logger.error(
				'Empty AI response received',
				new Error('Empty AI response'),
			);
			throw new Error('Empty AI response received');
		}

		const enrichedWords = JSON.parse(response);
		logger.info('Enrichment completed', {
			inputCount: words.length,
			outputCount: enrichedWords.length,
			sample: enrichedWords[0],
		});

		logger.end('enrichWordTokens');
		return enrichedWords;
	} catch (error) {
		logger.error('Word enrichment failed', error);
		throw new Error('Failed to enrich words with AI');
	}
}
