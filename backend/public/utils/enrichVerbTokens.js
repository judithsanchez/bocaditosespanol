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
exports.enrichVerbTokens = exports.verbTokenSchema = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = require("dotenv");
const constants_1 = require("../lib/constants");
const verbsTypes_1 = require("../lib/grammaticalInfo/verbsTypes");
const types_1 = require("../lib/types");
const Logger_1 = require("./Logger");
(0, dotenv_1.config)();
const logger = new Logger_1.Logger('VerbEnricher');
logger.info('Initializing AI Text Processor');
const genAI = new generative_ai_1.GoogleGenerativeAI((_a = process.env.GOOGLE_GENERATIVE_AI_KEY) !== null && _a !== void 0 ? _a : '');
exports.verbTokenSchema = {
    type: generative_ai_1.SchemaType.ARRAY,
    items: {
        type: generative_ai_1.SchemaType.OBJECT,
        properties: {
            tokenId: { type: generative_ai_1.SchemaType.STRING },
            content: { type: generative_ai_1.SchemaType.STRING },
            grammaticalInfo: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    tense: {
                        type: generative_ai_1.SchemaType.ARRAY,
                        items: {
                            type: generative_ai_1.SchemaType.STRING,
                            enum: Object.values(verbsTypes_1.VerbTense),
                        },
                    },
                    mood: { type: generative_ai_1.SchemaType.STRING, enum: Object.values(verbsTypes_1.VerbMood) },
                    person: {
                        type: generative_ai_1.SchemaType.ARRAY,
                        items: { type: generative_ai_1.SchemaType.STRING },
                    },
                    number: { type: generative_ai_1.SchemaType.STRING },
                    isRegular: { type: generative_ai_1.SchemaType.BOOLEAN },
                    infinitive: { type: generative_ai_1.SchemaType.STRING },
                    voice: { type: generative_ai_1.SchemaType.STRING, enum: Object.values(verbsTypes_1.VerbVoice) },
                    verbClass: { type: generative_ai_1.SchemaType.STRING, enum: Object.values(verbsTypes_1.VerbClass) },
                    gerund: { type: generative_ai_1.SchemaType.BOOLEAN },
                    pastParticiple: { type: generative_ai_1.SchemaType.BOOLEAN },
                    verbRegularity: {
                        type: generative_ai_1.SchemaType.STRING,
                        enum: Object.values(verbsTypes_1.VerbRegularity),
                    },
                    isReflexive: { type: generative_ai_1.SchemaType.BOOLEAN },
                },
                required: [
                    'tense',
                    'mood',
                    'person',
                    'number',
                    'isRegular',
                    'infinitive',
                    'voice',
                    'verbClass',
                    'gerund',
                    'pastParticiple',
                    'verbRegularity',
                    'isReflexive',
                ],
            },
        },
        required: ['tokenId', 'content', 'grammaticalInfo'],
    },
};
function enrichVerbTokens(tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.start('enrichVerbTokens');
        logger.info('Processing verb tokens', { count: tokens.length });
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: exports.verbTokenSchema,
            },
            systemInstruction: `
			Spanish Verb Analysis Task: Analyze each of the verbs and return the enriched verb tokens array.
			For each verb, provide detailed grammatical information including:
			- Tense: Identify all possible tenses the verb can be in. Possible values include: ${Object.values(verbsTypes_1.VerbTense).join(', ')}.
			- Mood: Specify the mood of the verb. Possible values include: ${Object.values(verbsTypes_1.VerbMood).join(', ')}.
			- Person: List all possible grammatical persons (e.g., first, second, third) the verb can represent. 
			  For example, if the verb is "estaba," it should include both first and third person. Possible values include: ${Object.values(types_1.GrammaticalPerson).join(', ')}.
			- Number: Specify whether the verb is singular or plural. Possible values include: ${Object.values(types_1.GrammaticalNumber).join(', ')}.
			- Regularity: Indicate if the verb is regular or irregular. Possible values include: ${Object.values(verbsTypes_1.VerbRegularity).join(', ')}.
			- Infinitive: Provide the infinitive form of the verb.

			- Voice: Specify the voice (e.g., active, passive). Possible values include: ${Object.values(verbsTypes_1.VerbVoice).join(', ')}.
			- Verb Class: Indicate the class of the verb. Possible values include: ${Object.values(verbsTypes_1.VerbClass).join(', ')}.
			- Gerund and Past Participle: Specify if the verb can be used as a gerund or past participle.
			- Reflexivity: Indicate if the verb is reflexive.
			Ensure that all possible interpretations of the verb are considered, especially in ambiguous cases.
		`,
            safetySettings: constants_1.geminiSafetySettings,
        });
        try {
            const prompt = {
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: `Input Verbs: ${JSON.stringify(tokens)}`,
                            },
                        ],
                    },
                ],
            };
            logger.info('Sending request to AI model');
            const result = yield model.generateContent(prompt);
            const response = yield result.response.text();
            const enrichedVerbs = JSON.parse(response);
            logger.info('Verbs enriched successfully', {
                inputCount: tokens.length,
                outputCount: enrichedVerbs.length,
            });
            logger.end('enrichVerbTokens');
            return enrichedVerbs;
        }
        catch (error) {
            logger.error('Verb enrichment failed', error);
            throw error;
        }
    });
}
exports.enrichVerbTokens = enrichVerbTokens;
