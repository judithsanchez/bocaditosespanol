import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {config} from 'dotenv';
import {IWord, PartOfSpeech, TokenType} from '../lib/types';
import {geminiSafetySettings} from '../lib/constants';
config();

// TODO: check why isFalseCognate is sometimes not present

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
			originalText: {type: SchemaType.STRING},
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
		},
		required: [
			'tokenId',
			'tokenType',
			'originalText',
			'normalizedToken',
			'translations',
			'hasSpecialChar',
			'partOfSpeech',
			'isSlang',
			'isCognate',
		],
	},
};

export async function enrichWordTokens(words: IWord[]): Promise<IWord[]> {
	console.log('\n🎯 Word Enrichment Pipeline Started');
	console.log('📊 Input Statistics:', {
		wordCount: words.length,
		firstWord: words[0]?.originalText || 'No words provided',
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
   - Include only the essential translations that capture the word's core meaning and function:
     Examples:
     * "las" -> ["the"]
     * "taxi" -> ["taxi"]
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
		const result = await model.generateContent(prompt);
		const response = await result.response.text();

		if (!response) {
			throw new Error('Empty AI response received');
		}

		const enrichedWords = JSON.parse(response);

		if (!Array.isArray(enrichedWords)) {
			throw new Error('Invalid response format - expected array');
		}

		console.log('✨ Enrichment Complete:', {
			inputCount: words.length,
			outputCount: enrichedWords.length,
			sample: enrichedWords[0],
		});

		return enrichedWords;
	} catch (error) {
		console.error('💥 Word Enrichment Error:', error);
		throw new Error('Failed to enrich words with AI');
	}
}
