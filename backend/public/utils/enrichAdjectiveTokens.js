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
exports.enrichAdjectiveTokens = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = require("dotenv");
const constants_1 = require("../lib/constants");
const types_1 = require("../lib/types");
const Logger_1 = require("./Logger");
(0, dotenv_1.config)();
const logger = new Logger_1.Logger('AdjectiveEnricher');
const genAI = new generative_ai_1.GoogleGenerativeAI((_a = process.env.GOOGLE_GENERATIVE_AI_KEY) !== null && _a !== void 0 ? _a : '');
const adjectiveTokenSchema = {
    type: generative_ai_1.SchemaType.ARRAY,
    items: {
        type: generative_ai_1.SchemaType.OBJECT,
        properties: {
            tokenId: { type: generative_ai_1.SchemaType.STRING },
            content: { type: generative_ai_1.SchemaType.STRING },
            grammaticalInfo: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    gender: {
                        type: generative_ai_1.SchemaType.STRING,
                        enum: Object.values(types_1.GrammaticalGender),
                    },
                    number: {
                        type: generative_ai_1.SchemaType.STRING,
                        enum: Object.values(types_1.GrammaticalNumber),
                    },
                    isPastParticiple: { type: generative_ai_1.SchemaType.BOOLEAN },
                },
                required: ['gender', 'number', 'isPastParticiple'],
            },
        },
        required: ['tokenId', 'content', 'grammaticalInfo'],
    },
};
function enrichAdjectiveTokens(tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.start('enrichAdjectiveTokens');
        logger.info('Processing adjective tokens', { count: tokens.length });
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: adjectiveTokenSchema,
            },
            systemInstruction: `
      Spanish Adjective Analysis Task: Analyze each adjective and return the enriched adjective tokens array.
      For each adjective, provide detailed grammatical information including:
      - Gender: Specify grammatical gender. Possible values: ${Object.values(types_1.GrammaticalGender).join(', ')}
      - Number: Specify if singular or plural. Possible values: ${Object.values(types_1.GrammaticalNumber).join(', ')}
      - Past Participle: Indicate if it's being used as a past participle
      Consider context and all possible interpretations for ambiguous cases.
    `,
            safetySettings: constants_1.geminiSafetySettings,
        });
        try {
            const prompt = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `Input Adjectives: ${JSON.stringify(tokens)}` }],
                    },
                ],
            };
            logger.info('Sending request to AI model');
            const result = yield model.generateContent(prompt);
            const response = yield result.response.text();
            const enrichedAdjectives = JSON.parse(response);
            logger.info('Adjectives enriched successfully', {
                inputCount: tokens.length,
                outputCount: enrichedAdjectives.length,
            });
            logger.end('enrichAdjectiveTokens');
            return enrichedAdjectives;
        }
        catch (error) {
            logger.error('Adjective enrichment failed', error);
            throw error;
        }
    });
}
exports.enrichAdjectiveTokens = enrichAdjectiveTokens;
