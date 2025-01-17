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
exports.enrichInterjectionTokens = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = require("dotenv");
const constants_1 = require("../lib/constants");
const interjectionsTypes_1 = require("../lib/grammaticalInfo/interjectionsTypes");
const Logger_1 = require("./Logger");
(0, dotenv_1.config)();
const logger = new Logger_1.Logger('InterjectionEnricher');
const genAI = new generative_ai_1.GoogleGenerativeAI((_a = process.env.GOOGLE_GENERATIVE_AI_KEY) !== null && _a !== void 0 ? _a : '');
const interjectionTokenSchema = {
    type: generative_ai_1.SchemaType.ARRAY,
    items: {
        type: generative_ai_1.SchemaType.OBJECT,
        properties: {
            tokenId: { type: generative_ai_1.SchemaType.STRING },
            content: { type: generative_ai_1.SchemaType.STRING },
            grammaticalInfo: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    interjectionEmotion: {
                        type: generative_ai_1.SchemaType.STRING,
                        enum: Object.values(interjectionsTypes_1.InterjectionEmotion),
                    },
                    interjectionType: {
                        type: generative_ai_1.SchemaType.STRING,
                        enum: Object.values(interjectionsTypes_1.InterjectionType),
                    },
                },
                required: ['interjectionEmotion', 'interjectionType'],
            },
        },
        required: ['tokenId', 'content', 'grammaticalInfo'],
    },
};
function enrichInterjectionTokens(tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.start('enrichInterjectionTokens');
        logger.info('Processing interjection tokens', { count: tokens.length });
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: interjectionTokenSchema,
            },
            systemInstruction: `
      Spanish Interjection Analysis Task: Analyze each interjection and return the enriched interjection tokens array.
      For each interjection, provide detailed information including:
      - Emotion: Specify the emotion expressed. Possible values: ${Object.values(interjectionsTypes_1.InterjectionEmotion).join(', ')}
      - Type: Specify the type. Possible values: ${Object.values(interjectionsTypes_1.InterjectionType).join(', ')}
    `,
            safetySettings: constants_1.geminiSafetySettings,
        });
        try {
            const prompt = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `Input Interjections: ${JSON.stringify(tokens)}` }],
                    },
                ],
            };
            logger.info('Sending request to AI model');
            const result = yield model.generateContent(prompt);
            const response = yield result.response.text();
            const enrichedInterjections = JSON.parse(response);
            logger.info('Interjections enriched successfully', {
                inputCount: tokens.length,
                outputCount: enrichedInterjections.length,
            });
            logger.end('enrichInterjectionTokens');
            return enrichedInterjections;
        }
        catch (error) {
            logger.error('Interjection enrichment failed', error);
            throw error;
        }
    });
}
exports.enrichInterjectionTokens = enrichInterjectionTokens;
