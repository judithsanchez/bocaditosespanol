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
exports.enrichPrepositionTokens = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = require("dotenv");
const constants_1 = require("../lib/constants");
const prepositionsTypes_1 = require("../lib/grammaticalInfo/prepositionsTypes");
const Logger_1 = require("./Logger");
(0, dotenv_1.config)();
const logger = new Logger_1.Logger('PrepositionEnricher');
const genAI = new generative_ai_1.GoogleGenerativeAI((_a = process.env.GOOGLE_GENERATIVE_AI_KEY) !== null && _a !== void 0 ? _a : '');
const prepositionTokenSchema = {
    type: generative_ai_1.SchemaType.ARRAY,
    items: {
        type: generative_ai_1.SchemaType.OBJECT,
        properties: {
            tokenId: { type: generative_ai_1.SchemaType.STRING },
            content: { type: generative_ai_1.SchemaType.STRING },
            grammaticalInfo: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    prepositionType: {
                        type: generative_ai_1.SchemaType.STRING,
                        enum: Object.values(prepositionsTypes_1.PrepositionType),
                    },
                    contractsWith: {
                        type: generative_ai_1.SchemaType.STRING,
                        enum: Object.values(prepositionsTypes_1.ContractsWith),
                    },
                },
                required: ['prepositionType', 'contractsWith'],
            },
        },
        required: ['tokenId', 'content', 'grammaticalInfo'],
    },
};
function enrichPrepositionTokens(tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.start('enrichPrepositionTokens');
        logger.info('Processing preposition tokens', { count: tokens.length });
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: prepositionTokenSchema,
            },
            systemInstruction: `
      Spanish Preposition Analysis Task: Analyze each preposition and return the enriched preposition tokens array.
      For each preposition, provide detailed information including:
      - Preposition Type: Specify if simple, compound, or locution. Possible values: ${Object.values(prepositionsTypes_1.PrepositionType).join(', ')}
      - Contracts With: Specify if it contracts with articles or pronouns. Possible values: ${Object.values(prepositionsTypes_1.ContractsWith).join(', ')}
    `,
            safetySettings: constants_1.geminiSafetySettings,
        });
        try {
            const prompt = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `Input Prepositions: ${JSON.stringify(tokens)}` }],
                    },
                ],
            };
            logger.info('Sending request to AI model');
            const result = yield model.generateContent(prompt);
            const response = yield result.response.text();
            const enrichedPrepositions = JSON.parse(response);
            logger.info('Prepositions enriched successfully', {
                inputCount: tokens.length,
                outputCount: enrichedPrepositions.length,
            });
            logger.end('enrichPrepositionTokens');
            return enrichedPrepositions;
        }
        catch (error) {
            logger.error('Preposition enrichment failed', error);
            throw error;
        }
    });
}
exports.enrichPrepositionTokens = enrichPrepositionTokens;
