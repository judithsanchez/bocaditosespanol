"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichWordTokens = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = require("dotenv");
const types_1 = require("../lib/types");
const constants_1 = require("../lib/constants");
const Logger_1 = require("./Logger");
(0, dotenv_1.config)();
// TODO: check why isFalseCognate is sometimes not present
const logger = new Logger_1.Logger('WordEnricher');
const genAI = new generative_ai_1.GoogleGenerativeAI((_a = process.env.GOOGLE_GENERATIVE_AI_KEY) !== null && _a !== void 0 ? _a : '');
const wordSchema = {
    type: generative_ai_1.SchemaType.ARRAY,
    items: {
        type: generative_ai_1.SchemaType.OBJECT,
        properties: {
            tokenId: { type: generative_ai_1.SchemaType.STRING },
            tokenType: { type: generative_ai_1.SchemaType.STRING, enum: [types_1.TokenType.Word] },
            content: { type: generative_ai_1.SchemaType.STRING },
            normalizedToken: { type: generative_ai_1.SchemaType.STRING },
            translations: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    english: {
                        type: generative_ai_1.SchemaType.ARRAY,
                        items: { type: generative_ai_1.SchemaType.STRING },
                    },
                },
            },
            hasSpecialChar: { type: generative_ai_1.SchemaType.BOOLEAN },
            partOfSpeech: { type: generative_ai_1.SchemaType.STRING },
            isSlang: { type: generative_ai_1.SchemaType.BOOLEAN },
            isCognate: { type: generative_ai_1.SchemaType.BOOLEAN },
            isFalseCognate: { type: generative_ai_1.SchemaType.BOOLEAN },
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
function enrichWordTokens(words) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        logger.start('enrichWordTokens');
        logger.info('Word enrichment pipeline started', {
            wordCount: words.length,
            firstWord: ((_a = words[0]) === null || _a === void 0 ? void 0 : _a.content) || 'No words provided',
        });
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: wordSchema,
            },
            safetySettings: constants_1.geminiSafetySettings,
            systemInstruction: 'Spanish Analysis Task: analyze each of the words and enrich them',
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

    - Part of speech from allowed values: ${Object.values(types_1.PartOfSpeech).join(', ')}
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
            const result = yield model.generateContent(prompt);
            const response = yield result.response.text();
            if (!response) {
                logger.error('Empty AI response received', new Error('Empty AI response'));
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
        }
        catch (error) {
            logger.error('Word enrichment failed', error);
            throw new Error('Failed to enrich words with AI');
        }
    });
}
exports.enrichWordTokens = enrichWordTokens;
