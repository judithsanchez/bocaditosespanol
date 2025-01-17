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
exports.enrichPronounTokens = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = require("dotenv");
const constants_1 = require("../lib/constants");
const pronounsTypes_1 = require("../lib/grammaticalInfo/pronounsTypes");
const types_1 = require("../lib/types");
const Logger_1 = require("./Logger");
(0, dotenv_1.config)();
const logger = new Logger_1.Logger('PronounEnricher');
const genAI = new generative_ai_1.GoogleGenerativeAI((_a = process.env.GOOGLE_GENERATIVE_AI_KEY) !== null && _a !== void 0 ? _a : '');
const pronounTokenSchema = {
    type: generative_ai_1.SchemaType.ARRAY,
    items: {
        type: generative_ai_1.SchemaType.OBJECT,
        properties: {
            tokenId: { type: generative_ai_1.SchemaType.STRING },
            content: { type: generative_ai_1.SchemaType.STRING },
            grammaticalInfo: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    pronounType: {
                        type: generative_ai_1.SchemaType.STRING,
                        enum: Object.values(pronounsTypes_1.PronounType),
                    },
                    person: {
                        type: generative_ai_1.SchemaType.STRING,
                        enum: Object.values(types_1.GrammaticalPerson),
                    },
                    gender: {
                        type: generative_ai_1.SchemaType.STRING,
                        enum: Object.values(types_1.GrammaticalGender),
                    },
                    number: {
                        type: generative_ai_1.SchemaType.STRING,
                        enum: Object.values(types_1.GrammaticalNumber),
                    },
                    case: {
                        type: generative_ai_1.SchemaType.STRING,
                        enum: Object.values(pronounsTypes_1.PronounCase),
                    },
                    isReflexive: { type: generative_ai_1.SchemaType.BOOLEAN },
                    isReciprocal: { type: generative_ai_1.SchemaType.BOOLEAN },
                },
                required: [
                    'pronounType',
                    'person',
                    'gender',
                    'number',
                    'case',
                    'isReflexive',
                    'isReciprocal',
                ],
            },
        },
        required: ['tokenId', 'content', 'grammaticalInfo'],
    },
};
function enrichPronounTokens(tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.start('enrichPronounTokens');
        logger.info('Processing pronoun tokens', { count: tokens.length });
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: pronounTokenSchema,
            },
            systemInstruction: `
      Spanish Pronoun Analysis Task: Analyze each pronoun and return the enriched pronoun tokens array.
      For each pronoun, provide detailed information including:
      - Pronoun Type: Specify the type. Possible values: ${Object.values(pronounsTypes_1.PronounType).join(', ')}
      - Person: Specify grammatical person. Possible values: ${Object.values(types_1.GrammaticalPerson).join(', ')}
      - Gender: Specify grammatical gender. Possible values: ${Object.values(types_1.GrammaticalGender).join(', ')}
      - Number: Specify if singular or plural. Possible values: ${Object.values(types_1.GrammaticalNumber).join(', ')}
      - Case: Specify the case. Possible values: ${Object.values(pronounsTypes_1.PronounCase).join(', ')}
      - Reflexive: Indicate if it's reflexive
      - Reciprocal: Indicate if it's reciprocal
    `,
            safetySettings: constants_1.geminiSafetySettings,
        });
        try {
            const prompt = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `Input Pronouns: ${JSON.stringify(tokens)}` }],
                    },
                ],
            };
            logger.info('Sending request to AI model');
            const result = yield model.generateContent(prompt);
            const response = yield result.response.text();
            const enrichedPronouns = JSON.parse(response);
            logger.info('Pronouns enriched successfully', {
                inputCount: tokens.length,
                outputCount: enrichedPronouns.length,
            });
            logger.end('enrichPronounTokens');
            return enrichedPronouns;
        }
        catch (error) {
            logger.error('Pronoun enrichment failed', error);
            throw error;
        }
    });
}
exports.enrichPronounTokens = enrichPronounTokens;
