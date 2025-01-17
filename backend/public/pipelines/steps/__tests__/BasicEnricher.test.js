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
const BasicEnricher_1 = require("../BasicEnricher");
const batchProcessor_1 = require("../../../utils/batchProcessor");
const enrichWordTokens_1 = require("../../../utils/enrichWordTokens");
const fixtures_1 = require("lib/fixtures");
jest.mock('../../../utils/batchProcessor');
jest.mock('../../../utils/enrichWordTokens');
jest.mock('../../../utils/index');
// TODO: fix first 2 cases
describe('BasicEnricherStep', () => {
    let enricher;
    let context;
    beforeEach(() => {
        enricher = new BasicEnricher_1.BasicEnricherStep();
        // @ts-expect-error: emptyContext is intentionally missing properties for this test
        context = Object.assign({}, fixtures_1.basicEnricherFixtures.inputContext);
        batchProcessor_1.batchProcessor.mockReset();
        enrichWordTokens_1.enrichWordTokens.mockReset();
    });
    describe('process', () => {
        it('successfully enriches tokens with grammatical information', () => __awaiter(void 0, void 0, void 0, function* () {
            batchProcessor_1.batchProcessor.mockResolvedValue(fixtures_1.basicEnricherFixtures.expectedEnrichedOutput.tokens.enriched);
            const result = yield enricher.process(context);
            expect(result.tokens.enriched).toEqual(fixtures_1.basicEnricherFixtures.expectedEnrichedOutput.tokens.enriched);
            expect(batchProcessor_1.batchProcessor).toHaveBeenCalledWith({
                items: expect.any(Array),
                processingFn: enrichWordTokens_1.enrichWordTokens,
                batchSize: fixtures_1.basicEnricherFixtures.rateLimits.BATCH_SIZE,
                options: {
                    retryAttempts: fixtures_1.basicEnricherFixtures.rateLimits.RETRY_ATTEMPTS,
                    delayBetweenBatches: fixtures_1.basicEnricherFixtures.rateLimits.DELAY_BETWEEN_BATCHES,
                    maxRequestsPerMinute: fixtures_1.basicEnricherFixtures.rateLimits.REQUESTS_PER_MINUTE,
                },
            });
        }));
        it('correctly handles empty token list', () => __awaiter(void 0, void 0, void 0, function* () {
            // @ts-expect-error: emptyContext is intentionally missing properties for this test
            const emptyContext = {
                tokens: { all: [] },
            };
            const result = yield enricher.process(emptyContext);
            expect(result.tokens.enriched).toEqual([]);
        }));
        it('preserves non-word tokens in the output', () => __awaiter(void 0, void 0, void 0, function* () {
            batchProcessor_1.batchProcessor.mockResolvedValue([]);
            const result = yield enricher.process(context);
            const punctuationTokens = result.tokens.enriched.filter(token => token.tokenType === 'punctuationSign');
            expect(punctuationTokens).toHaveLength(1);
        }));
    });
    describe('grammatical structure', () => {
        it('adds verb grammatical structure correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const verbToken = fixtures_1.basicEnricherFixtures.expectedEnrichedOutput.tokens.enriched[0];
            batchProcessor_1.batchProcessor.mockResolvedValue([verbToken]);
            const result = yield enricher.process(context);
            expect(result.tokens.enriched[0].grammaticalInfo).toEqual({
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
            });
        }));
        it('adds noun grammatical structure correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const nounToken = fixtures_1.basicEnricherFixtures.expectedEnrichedOutput.tokens.enriched[1];
            batchProcessor_1.batchProcessor.mockResolvedValue([nounToken]);
            const result = yield enricher.process(context);
            expect(result.tokens.enriched[0].grammaticalInfo).toEqual({
                gender: '',
                number: '',
                isProperNoun: false,
                diminutive: false,
            });
        }));
        it('handles unknown part of speech correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const unknownToken = fixtures_1.basicEnricherFixtures.edgeCases.unknownPartOfSpeech;
            batchProcessor_1.batchProcessor.mockResolvedValue([unknownToken]);
            // @ts-expect-error: emptyContext is intentionally missing properties for this test
            const result = yield enricher.process({
                tokens: { all: [unknownToken] },
            });
            expect(result.tokens.enriched[0].grammaticalInfo).toEqual({});
        }));
    });
    describe('part of speech statistics', () => {
        it('generates correct statistics for mixed parts of speech', () => __awaiter(void 0, void 0, void 0, function* () {
            batchProcessor_1.batchProcessor.mockResolvedValue(fixtures_1.basicEnricherFixtures.posStats.input);
            const result = yield enricher.process({
                tokens: { all: fixtures_1.basicEnricherFixtures.posStats.input },
            });
            // Access private method for testing statistics
            const stats = enricher.getPartOfSpeechStats(result.tokens.enriched);
            expect(stats).toEqual(fixtures_1.basicEnricherFixtures.posStats.expected);
        }));
    });
    describe('error handling', () => {
        it('handles batch processor errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            batchProcessor_1.batchProcessor.mockRejectedValue(new Error('Batch processing failed'));
            yield expect(enricher.process(context)).rejects.toThrow('Batch processing failed');
        }));
    });
});
