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
exports.enrichSentencesWithAI = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = require("dotenv");
const constants_1 = require("../lib/constants");
const Logger_1 = require("./Logger");
(0, dotenv_1.config)();
const logger = new Logger_1.Logger('SentenceEnricher');
const genAI = new generative_ai_1.GoogleGenerativeAI((_a = process.env.GOOGLE_GENERATIVE_AI_KEY) !== null && _a !== void 0 ? _a : '');
const sentenceSchema = {
    type: generative_ai_1.SchemaType.ARRAY,
    items: {
        type: generative_ai_1.SchemaType.OBJECT,
        properties: {
            sentenceId: { type: generative_ai_1.SchemaType.STRING },
            content: { type: generative_ai_1.SchemaType.STRING },
            translations: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    english: {
                        type: generative_ai_1.SchemaType.OBJECT,
                        properties: {
                            literal: { type: generative_ai_1.SchemaType.STRING },
                            contextual: { type: generative_ai_1.SchemaType.STRING },
                        },
                        required: ['literal', 'contextual'],
                    },
                },
                required: ['english'],
            },
            tokenIds: {
                type: generative_ai_1.SchemaType.ARRAY,
                items: { type: generative_ai_1.SchemaType.STRING },
            },
        },
        required: ['sentenceId', 'content', 'translations', 'tokenIds'],
    },
};
const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: sentenceSchema,
    },
    safetySettings: constants_1.geminiSafetySettings,
});
function enrichSentencesWithAI(sentences) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        logger.start('enrichSentencesWithAI');
        logger.info('Starting AI enrichment pipeline', {
            sentenceCount: sentences.length,
            firstSentence: ((_a = sentences[0]) === null || _a === void 0 ? void 0 : _a.content) || 'No sentences provided',
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

Input Array: ${JSON.stringify(sentences)}

CRITICAL REQUIREMENTS:
1. MUST return an ARRAY with EXACTLY ${sentences.length} processed sentences
2. Each sentence must maintain its original position in the array
3. Process ALL sentences

STRICT PROCESSING RULES:
1. OUTPUT MUST BE AN ARRAY of processed sentences
2. For EACH sentence in the array:
	  - ADD complete English contextual translation
	  - ADD literal word-for-word translation that maintains Spanish grammar structure but still makes sense on the context
			Example: "Yo tengo hambre" → "I have hunger"
			Example: "Me gusta bailar" → "To me pleases to dance"
	  - KEEP all other existing properties untocuhed

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
            const result = yield model.generateContent(prompt);
            const response = yield result.response.text();
            logger.info('Processing AI response', {
                responseLength: response.length,
            });
            if (!response) {
                logger.error('Empty AI response', new Error(constants_1.errors.aiProcessing.emptyResponse));
                throw new Error(constants_1.errors.aiProcessing.emptyResponse);
            }
            const enrichedSentences = JSON.parse(response);
            logger.info('Enrichment completed', {
                inputCount: sentences.length,
                outputCount: enrichedSentences.length,
                samplesProcessed: enrichedSentences.map((s) => ({
                    id: s.sentenceId,
                    hasTranslation: !!s.translations.english.contextual,
                    hasLiteralTranslation: !!s.translations.english.literal,
                })),
            });
            logger.end('enrichSentencesWithAI');
            return enrichedSentences;
        }
        catch (error) {
            logger.error('AI processing failed', error);
            throw error;
        }
    });
}
exports.enrichSentencesWithAI = enrichSentencesWithAI;
