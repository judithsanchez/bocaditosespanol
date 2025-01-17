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
exports.SentenceEnricherSteps = void 0;
const index_1 = require("../../utils/index");
const index_2 = require("../../utils/index");
const batchProcessor_1 = require("../../utils/batchProcessor");
class SentenceEnricherSteps {
    constructor() {
        Object.defineProperty(this, "logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new index_1.Logger('SentenceEnricherStep')
        });
    }
    process(context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.start('process');
            const enrichedSentences = yield (0, batchProcessor_1.batchProcessor)({
                items: context.sentences.deduplicated,
                processingFn: index_2.enrichSentencesWithAI,
                batchSize: SentenceEnricherSteps.RATE_LIMITS.BATCH_SIZE,
                options: {
                    retryAttempts: SentenceEnricherSteps.RATE_LIMITS.RETRY_ATTEMPTS,
                    delayBetweenBatches: SentenceEnricherSteps.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
                    maxRequestsPerMinute: SentenceEnricherSteps.RATE_LIMITS.REQUESTS_PER_MINUTE,
                },
            });
            context.sentences.enriched = enrichedSentences;
            this.logger.info('Sentence enrichment completed', {
                totalSentences: context.sentences.enriched.length,
            });
            this.logger.end('process');
            return context;
        });
    }
}
exports.SentenceEnricherSteps = SentenceEnricherSteps;
Object.defineProperty(SentenceEnricherSteps, "RATE_LIMITS", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: {
        BATCH_SIZE: 5,
        RETRY_ATTEMPTS: 3,
        DELAY_BETWEEN_BATCHES: 6000,
        REQUESTS_PER_MINUTE: 1,
    }
});
