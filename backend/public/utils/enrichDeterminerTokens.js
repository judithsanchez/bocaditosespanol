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
exports.enrichDeterminerTokens = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = require("dotenv");
const constants_1 = require("../lib/constants");
const determinersTypes_1 = require("../lib/grammaticalInfo/determinersTypes");
const types_1 = require("../lib/types");
const Logger_1 = require("./Logger");
(0, dotenv_1.config)();
const logger = new Logger_1.Logger('DeterminerEnricher');
const genAI = new generative_ai_1.GoogleGenerativeAI((_a = process.env.GOOGLE_GENERATIVE_AI_KEY) !== null && _a !== void 0 ? _a : '');
const determinerTokenSchema = {
    type: generative_ai_1.SchemaType.ARRAY,
    items: {
        type: generative_ai_1.SchemaType.OBJECT,
        properties: {
            tokenId: { type: generative_ai_1.SchemaType.STRING },
            content: { type: generative_ai_1.SchemaType.STRING },
            grammaticalInfo: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    determinerType: {
                        type: generative_ai_1.SchemaType.STRING,
                        enum: Object.values(determinersTypes_1.DeterminerType),
                    },
                    gender: {
                        type: generative_ai_1.SchemaType.STRING,
                        enum: Object.values(types_1.GrammaticalGender),
                    },
                    number: {
                        type: generative_ai_1.SchemaType.STRING,
                        enum: Object.values(types_1.GrammaticalNumber),
                    },
                },
                required: ['determinerType', 'gender', 'number'],
            },
        },
        required: ['tokenId', 'content', 'grammaticalInfo'],
    },
};
function enrichDeterminerTokens(tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.start('enrichDeterminerTokens');
        logger.info('Processing determiner tokens', { count: tokens.length });
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: determinerTokenSchema,
            },
            systemInstruction: `
      Spanish Determiner Analysis Task: Analyze each determiner and return the enriched determiner tokens array.
      For each determiner, provide detailed grammatical information including:
      - Determiner Type: Specify the type. Possible values: ${Object.values(determinersTypes_1.DeterminerType).join(', ')}
      - Gender: Specify grammatical gender. Possible values: ${Object.values(types_1.GrammaticalGender).join(', ')}
      - Number: Specify if singular or plural. Possible values: ${Object.values(types_1.GrammaticalNumber).join(', ')}
    `,
            safetySettings: constants_1.geminiSafetySettings,
        });
        try {
            const prompt = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `Input Determiners: ${JSON.stringify(tokens)}` }],
                    },
                ],
            };
            logger.info('Sending request to AI model');
            const result = yield model.generateContent(prompt);
            const response = yield result.response.text();
            const enrichedDeterminers = JSON.parse(response);
            logger.info('Determiners enriched successfully', {
                inputCount: tokens.length,
                outputCount: enrichedDeterminers.length,
            });
            logger.end('enrichDeterminerTokens');
            return enrichedDeterminers;
        }
        catch (error) {
            logger.error('Determiner enrichment failed', error);
            throw error;
        }
    });
}
exports.enrichDeterminerTokens = enrichDeterminerTokens;
