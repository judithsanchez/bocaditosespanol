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
exports.enrichConjunctionTokens = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = require("dotenv");
const constants_1 = require("../lib/constants");
const conjunctionsTypes_1 = require("../lib/grammaticalInfo/conjunctionsTypes");
const Logger_1 = require("./Logger");
(0, dotenv_1.config)();
const logger = new Logger_1.Logger('ConjunctionEnricher');
const genAI = new generative_ai_1.GoogleGenerativeAI((_a = process.env.GOOGLE_GENERATIVE_AI_KEY) !== null && _a !== void 0 ? _a : '');
const conjunctionTokenSchema = {
    type: generative_ai_1.SchemaType.ARRAY,
    items: {
        type: generative_ai_1.SchemaType.OBJECT,
        properties: {
            tokenId: { type: generative_ai_1.SchemaType.STRING },
            content: { type: generative_ai_1.SchemaType.STRING },
            grammaticalInfo: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    conjunctionType: {
                        type: generative_ai_1.SchemaType.STRING,
                        enum: Object.values(conjunctionsTypes_1.ConjunctionType),
                    },
                    conjunctionFunction: {
                        type: generative_ai_1.SchemaType.STRING,
                        enum: Object.values(conjunctionsTypes_1.ConjunctionFunction),
                    },
                },
                required: ['conjunctionType', 'conjunctionFunction'],
            },
        },
        required: ['tokenId', 'content', 'grammaticalInfo'],
    },
};
function enrichConjunctionTokens(tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.start('enrichConjunctionTokens');
        logger.info('Processing conjunction tokens', { count: tokens.length });
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: conjunctionTokenSchema,
            },
            systemInstruction: `
      Spanish Conjunction Analysis Task: Analyze each conjunction and return the enriched conjunction tokens array.
      For each conjunction, provide detailed grammatical information including:
      - Conjunction Type: Specify if coordinating or subordinating. Possible values: ${Object.values(conjunctionsTypes_1.ConjunctionType).join(', ')}
      - Conjunction Function: Specify the function. Possible values: ${Object.values(conjunctionsTypes_1.ConjunctionFunction).join(', ')}
      Consider context and all possible interpretations for ambiguous cases.
    `,
            safetySettings: constants_1.geminiSafetySettings,
        });
        try {
            const prompt = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `Input Conjunctions: ${JSON.stringify(tokens)}` }],
                    },
                ],
            };
            logger.info('Sending request to AI model');
            const result = yield model.generateContent(prompt);
            const response = yield result.response.text();
            const enrichedConjunctions = JSON.parse(response);
            logger.info('Conjunctions enriched successfully', {
                inputCount: tokens.length,
                outputCount: enrichedConjunctions.length,
            });
            logger.end('enrichConjunctionTokens');
            return enrichedConjunctions;
        }
        catch (error) {
            logger.error('Conjunction enrichment failed', error);
            throw error;
        }
    });
}
exports.enrichConjunctionTokens = enrichConjunctionTokens;
