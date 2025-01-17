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
exports.enrichAdverbTokens = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = require("dotenv");
const constants_1 = require("../lib/constants");
const adverbsTypes_1 = require("../lib/grammaticalInfo/adverbsTypes");
const Logger_1 = require("./Logger");
(0, dotenv_1.config)();
const logger = new Logger_1.Logger('AdverbEnricher');
const genAI = new generative_ai_1.GoogleGenerativeAI((_a = process.env.GOOGLE_GENERATIVE_AI_KEY) !== null && _a !== void 0 ? _a : '');
const adverbTokenSchema = {
    type: generative_ai_1.SchemaType.ARRAY,
    items: {
        type: generative_ai_1.SchemaType.OBJECT,
        properties: {
            tokenId: { type: generative_ai_1.SchemaType.STRING },
            content: { type: generative_ai_1.SchemaType.STRING },
            grammaticalInfo: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    adverbType: {
                        type: generative_ai_1.SchemaType.STRING,
                        enum: Object.values(adverbsTypes_1.AdverbType),
                    },
                    usesMente: { type: generative_ai_1.SchemaType.BOOLEAN },
                },
                required: ['adverbType', 'usesMente'],
            },
        },
        required: ['tokenId', 'content', 'grammaticalInfo'],
    },
};
function enrichAdverbTokens(tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.start('enrichAdverbTokens');
        logger.info('Processing adverb tokens', { count: tokens.length });
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: adverbTokenSchema,
            },
            systemInstruction: `
      Spanish Adverb Analysis Task: Analyze each adverb and return the enriched adverb tokens array.
      For each adverb, provide detailed grammatical information including:
      - Adverb Type: Specify the type. Possible values: ${Object.values(adverbsTypes_1.AdverbType).join(', ')}
      - Mente Usage: Indicate if it ends in -mente
      Consider context and all possible interpretations for ambiguous cases.
    `,
            safetySettings: constants_1.geminiSafetySettings,
        });
        try {
            const prompt = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `Input Adverbs: ${JSON.stringify(tokens)}` }],
                    },
                ],
            };
            logger.info('Sending request to AI model');
            const result = yield model.generateContent(prompt);
            const response = yield result.response.text();
            const enrichedAdverbs = JSON.parse(response);
            logger.info('Adverbs enriched successfully', {
                inputCount: tokens.length,
                outputCount: enrichedAdverbs.length,
            });
            logger.end('enrichAdverbTokens');
            return enrichedAdverbs;
        }
        catch (error) {
            logger.error('Adverb enrichment failed', error);
            throw error;
        }
    });
}
exports.enrichAdverbTokens = enrichAdverbTokens;
