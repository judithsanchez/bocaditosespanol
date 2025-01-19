import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {config} from 'dotenv';
import {IWord, PartOfSpeech, TokenType} from '../lib/types';
import {geminiSafetySettings} from '../lib/constants';
import {Logger} from './Logger';
config();

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
		model: 'gemini-1.5-flash-8b',
		generationConfig: {
			responseMimeType: 'application/json',
			responseSchema: wordSchema,
		},
		safetySettings: geminiSafetySettings,
		systemInstruction: `
    You are a bilingual Spanish-English linguistic expert with advanced knowledge of grammar, vocabulary, and idiomatic expressions in both languages. 
    Your role is to analyze Spanish words, detect whether they are slang, cognates, or false cognates, 
    and assign each word its correct part of speech and accurate English translations. 
    Use formal dictionary definitions, and account for common real-world usage where relevant (e.g., spanglish). 
    Be precise, concise, and ensure the output strictly follows the JSON schema requested.
  `,
	});

	const prompt = {
		contents: [
			{
				role: 'user',
				parts: [
					{
						text: `Spanish Word Analysis Task:

Input Array: ${JSON.stringify(words)}

GOAL:
Enrich each Spanish word in the input array by providing:
- All possible accurate English translations (no pronouns for verb forms).
- Part of speech (one of: ${Object.values(PartOfSpeech).join(', ')}).
- Boolean flags:
  1) "isSlang" -> true if the word is Spanglish or a borrowed/informal usage in Spanish
  2) "isCognate" -> true if Spanish and English share ≥75% spelling overlap *and* have the same primary meaning
  3) "isFalseCognate" -> true if Spanish and English share ≥75% spelling overlap *but* the primary meanings differ significantly

RETURN REQUIREMENTS:
1. The output must be a JSON array of length exactly ${words.length}.
2. Each element of the array must preserve the same order as the input.
3. Each element must follow the schema structure:
   {
     "tokenId": string,
     "tokenType": "word",
     "content": string,
     "normalizedToken": string,
     "translations": {
       "english": string[]
     },
     "hasSpecialChar": boolean,
     "partOfSpeech": string,
     "isSlang": boolean,
     "isCognate": boolean,
     "isFalseCognate": boolean
   }

DEFINITIONS & EXAMPLES:

1) TRANSLATIONS
   - Include all possible, commonly accepted dictionary meanings in English.
   - For verbs, do not prepend pronouns (e.g., "estaba" -> ["was", "used to be"]).
   - Examples:
     * "estaba" -> ["was", "used to be"]
     * "las" -> ["the"]
     * "taxi" -> ["taxi", "cab"]
     * "era" -> ["was", "used to be"]
     * "ella" -> ["she", "her"]
     * "de" -> ["of", "from", "about"]

2) PART OF SPEECH
   - Must be one of: ${Object.values(PartOfSpeech).join(', ')} (e.g., "noun", "verb", "adjective", etc.)

3) isSlang
   - Mark true if it is a Spanglish term, a borrowed English word written into Spanish, or generally informal usage not found in standard dictionaries.
   - Mark false otherwise.
   - Example: "textear" -> isSlang=true; "idea" -> isSlang=false.

4) COGNATE ANALYSIS
   - Mark "isCognate"=true if:
     a) The Spanish word and an English word share ≥75% spelling/phonetic overlap (examples: "idea" in Spanish and English, "doctor" in Spanish and English, "animal"/"animal", "biología"/"biology").
     b) They share the same or very similar primary meaning.
   - Mark "isFalseCognate"=true if:
     a) The Spanish word and an English word share ≥75% spelling/phonetic overlap
     b) BUT they differ *significantly* in meaning (false friends). 
     *Examples: "carpeta" (folder) vs. "carpet", "embarazada" (pregnant) vs. "embarrassed", "actual" (current) vs. "actual" (real).
   - These flags must be mutually exclusive:
     * if "isCognate"=true, then "isFalseCognate"=false
     * if "isFalseCognate"=true, then "isCognate"=false

5) ADDITIONAL CLARIFICATIONS
   - Use standard Spanish dictionary definitions to determine meaning.
   - If you suspect the word has a regionally informal usage or is derived from English, set "isSlang"=true.
   - For borderline cases, rely on the **most common usage**.

IMPORTANT:
- Return only the enriched JSON array. Do not include explanations or extra text.
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
