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
const SentenceEnricher_1 = require("../SentenceEnricher");
const fixtures_1 = require("../../../lib/fixtures");
const batchProcessor_1 = require("../../../utils/batchProcessor");
const index_1 = require("../../../utils/index");
jest.mock('../../../utils/batchProcessor');
jest.mock('../../../utils/index');
describe('SentenceEnricherSteps', () => {
    let enricher;
    let context;
    beforeEach(() => {
        enricher = new SentenceEnricher_1.SentenceEnricherSteps();
        context = Object.assign({}, fixtures_1.sentenceEnricherFixtures.inputContext);
        batchProcessor_1.batchProcessor.mockReset();
        index_1.enrichSentencesWithAI.mockReset();
    });
    describe('process', () => {
        it('successfully enriches sentences with translations', () => __awaiter(void 0, void 0, void 0, function* () {
            batchProcessor_1.batchProcessor.mockResolvedValue(fixtures_1.sentenceEnricherFixtures.mockResponses.enrichedSentences);
            const result = yield enricher.process(context);
            expect(result.sentences.enriched).toEqual(fixtures_1.sentenceEnricherFixtures.mockResponses.enrichedSentences);
            expect(batchProcessor_1.batchProcessor).toHaveBeenCalledWith({
                items: fixtures_1.sentenceEnricherFixtures.inputContext.sentences.deduplicated,
                processingFn: index_1.enrichSentencesWithAI,
                batchSize: 5,
                options: {
                    retryAttempts: 3,
                    delayBetweenBatches: 6000,
                    maxRequestsPerMinute: 1,
                },
            });
        }));
    });
});
