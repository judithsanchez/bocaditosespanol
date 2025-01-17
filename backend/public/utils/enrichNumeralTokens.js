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
exports.enrichNumeralTokens = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = require("dotenv");
const constants_1 = require("../lib/constants");
const numeralsTypes_1 = require("../lib/grammaticalInfo/numeralsTypes");
const types_1 = require("../lib/types");
const Logger_1 = require("./Logger");
(0, dotenv_1.config)();
const logger = new Logger_1.Logger('NumeralEnricher');
const genAI = new generative_ai_1.GoogleGenerativeAI((_a = process.env.GOOGLE_GENERATIVE_AI_KEY) !== null && _a !== void 0 ? _a : '');
const numeralTokenSchema = {
    type: generative_ai_1.SchemaType.ARRAY,
    items: {
        type: generative_ai_1.SchemaType.OBJECT,
        properties: {
            tokenId: { type: generative_ai_1.SchemaType.STRING },
            content: { type: generative_ai_1.SchemaType.STRING },
            grammaticalInfo: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    numeralType: {
                        type: generative_ai_1.SchemaType.STRING,
                        enum: Object.values(numeralsTypes_1.NumeralType),
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
                required: ['numeralType', 'gender', 'number'],
            },
        },
        required: ['tokenId', 'content', 'grammaticalInfo'],
    },
};
function enrichNumeralTokens(tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.start('enrichNumeralTokens');
        logger.info('Processing numeral tokens', { count: tokens.length });
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: numeralTokenSchema,
            },
            systemInstruction: `
      Spanish Numeral Analysis Task: Analyze each numeral and return the enriched numeral tokens array.
      For each numeral, provide detailed information including:
      - Numeral Type: Specify the type. Possible values: ${Object.values(numeralsTypes_1.NumeralType).join(', ')}
      - Gender: Specify grammatical gender if applicable. Possible values: ${Object.values(types_1.GrammaticalGender).join(', ')}
      - Number: Specify if singular or plural if applicable. Possible values: ${Object.values(types_1.GrammaticalNumber).join(', ')}
    `,
            safetySettings: constants_1.geminiSafetySettings,
        });
        try {
            const prompt = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `Input Numerals: ${JSON.stringify(tokens)}` }],
                    },
                ],
            };
            logger.info('Sending request to AI model');
            const result = yield model.generateContent(prompt);
            const response = yield result.response.text();
            const enrichedNumerals = JSON.parse(response);
            logger.info('Numerals enriched successfully', {
                inputCount: tokens.length,
                outputCount: enrichedNumerals.length,
            });
            logger.end('enrichNumeralTokens');
            return enrichedNumerals;
        }
        catch (error) {
            logger.error('Numeral enrichment failed', error);
            throw error;
        }
    });
}
exports.enrichNumeralTokens = enrichNumeralTokens;
