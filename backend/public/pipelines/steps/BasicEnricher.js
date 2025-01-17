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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicEnricherStep = void 0;
const index_1 = require("../../utils/index");
const types_1 = require("../../lib/types");
const batchProcessor_1 = require("../../utils/batchProcessor");
const enrichWordTokens_1 = require("../../utils/enrichWordTokens");
class BasicEnricherStep {
    constructor() {
        Object.defineProperty(this, "logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new index_1.Logger('BasicEnricherStep')
        });
    }
    process(context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.start('process');
            const wordTokens = context.tokens.all.filter((token) => token.tokenType === types_1.TokenType.Word);
            this.logger.info('Starting basic token enrichment', {
                totalTokens: wordTokens.length,
            });
            const enrichedTokens = yield (0, batchProcessor_1.batchProcessor)({
                items: wordTokens,
                processingFn: enrichWordTokens_1.enrichWordTokens,
                batchSize: BasicEnricherStep.RATE_LIMITS.BATCH_SIZE,
                options: {
                    retryAttempts: BasicEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
                    delayBetweenBatches: BasicEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
                    maxRequestsPerMinute: BasicEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
                },
            });
            const enrichedWithStructure = enrichedTokens.map(token => this.addGrammaticalStructure(token));
            context.tokens.enriched = [
                ...enrichedWithStructure,
                ...context.tokens.all.filter(t => t.tokenType !== types_1.TokenType.Word),
            ];
            this.logger.info('Basic enrichment completed', {
                enrichedTokens: enrichedWithStructure.length,
                byPartOfSpeech: this.getPartOfSpeechStats(enrichedWithStructure),
            });
            this.logger.end('process');
            return context;
        });
    }
    addGrammaticalStructure(token) {
        if (!token.partOfSpeech || typeof token.partOfSpeech !== 'string')
            return token;
        const grammaticalInfo = this.getGrammaticalTemplate(token.partOfSpeech);
        return Object.assign(Object.assign({}, token), { grammaticalInfo });
    }
    getGrammaticalTemplate(partOfSpeech) {
        switch (partOfSpeech) {
            case types_1.PartOfSpeech.Verb:
                return {
                    tense: [],
                    mood: '',
                    person: [],
                    number: '',
                    isRegular: false,
                    infinitive: '',
                    voice: '',
                    verbClass: '',
                    gerund: false,
                    pastParticiple: false,
                    verbRegularity: '',
                    isReflexive: false,
                };
            case types_1.PartOfSpeech.Noun:
                return {
                    gender: '',
                    number: '',
                    isProperNoun: false,
                    diminutive: false,
                };
            default:
                return {};
        }
    }
    getPartOfSpeechStats(tokens) {
        return tokens.reduce((acc, token) => {
            const pos = token.partOfSpeech || 'unknown';
            acc[pos] = (acc[pos] || 0) + 1;
            return acc;
        }, {});
    }
}
exports.BasicEnricherStep = BasicEnricherStep;
Object.defineProperty(BasicEnricherStep, "RATE_LIMITS", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: {
        BATCH_SIZE: 10,
        RETRY_ATTEMPTS: 3,
        DELAY_BETWEEN_BATCHES: 6000,
        REQUESTS_PER_MINUTE: 1,
    }
});
