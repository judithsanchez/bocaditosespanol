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
const SpecializedEnricher_1 = require("../SpecializedEnricher");
const fixtures_1 = require("../../../lib/fixtures");
const batchProcessor_1 = require("../../../utils/batchProcessor");
const index_1 = require("../../../utils/index");
jest.mock('../../../utils/batchProcessor');
jest.mock('../../../utils/index');
// TODO: fix all failing
describe('SpecializedEnricherStep', () => {
    let enricher;
    let context;
    beforeEach(() => {
        enricher = new SpecializedEnricher_1.SpecializedEnricherStep();
        context = {
            tokens: {
                enriched: fixtures_1.basicEnricherFixtures.inputContext.tokens.all,
            },
        };
        batchProcessor_1.batchProcessor.mockReset();
        index_1.enrichVerbTokens.mockReset();
        index_1.enrichNounTokens.mockReset();
        index_1.enrichAdjectiveTokens.mockReset();
    });
    describe('process', () => {
        it('successfully enriches verb tokens', () => __awaiter(void 0, void 0, void 0, function* () {
            const verbToken = fixtures_1.basicEnricherFixtures.expectedEnrichedOutput.tokens.enriched[0];
            batchProcessor_1.batchProcessor.mockResolvedValue([verbToken]);
            const result = yield enricher.process(context);
            expect(result.tokens.enriched).toContainEqual(expect.objectContaining({
                partOfSpeech: 'verb',
                grammaticalInfo: expect.objectContaining({
                    tense: expect.any(Array),
                    mood: expect.any(String),
                }),
            }));
        }));
        it('successfully enriches noun tokens', () => __awaiter(void 0, void 0, void 0, function* () {
            const nounToken = fixtures_1.basicEnricherFixtures.expectedEnrichedOutput.tokens.enriched[1];
            batchProcessor_1.batchProcessor.mockResolvedValue([nounToken]);
            const result = yield enricher.process(context);
            expect(result.tokens.enriched).toContainEqual(expect.objectContaining({
                partOfSpeech: 'noun',
                grammaticalInfo: expect.objectContaining({
                    gender: expect.any(String),
                    number: expect.any(String),
                }),
            }));
        }));
        it('maintains token order after enrichment', () => __awaiter(void 0, void 0, void 0, function* () {
            const enrichedTokens = fixtures_1.basicEnricherFixtures.expectedEnrichedOutput.tokens.enriched;
            batchProcessor_1.batchProcessor.mockResolvedValue(enrichedTokens);
            const result = yield enricher.process(context);
            expect(result.tokens.enriched.map(t => t.tokenId)).toEqual(enrichedTokens.map(t => t.tokenId));
        }));
        it('respects rate limits between batch processing', () => __awaiter(void 0, void 0, void 0, function* () {
            const startTime = Date.now();
            yield enricher.process(context);
            const endTime = Date.now();
            expect(endTime - startTime).toBeGreaterThanOrEqual(SpecializedEnricher_1.SpecializedEnricherStep['RATE_LIMITS'].DELAY_BETWEEN_BATCHES);
        }));
        it('processes multiple parts of speech in sequence', () => __awaiter(void 0, void 0, void 0, function* () {
            const mixedTokens = [
                ...fixtures_1.basicEnricherFixtures.expectedEnrichedOutput.tokens.enriched,
            ];
            batchProcessor_1.batchProcessor.mockResolvedValue(mixedTokens);
            const result = yield enricher.process(context);
            expect(result.tokens.enriched).toEqual(expect.arrayContaining(mixedTokens));
            expect(batchProcessor_1.batchProcessor).toHaveBeenCalledTimes(Object.keys(mixedTokens).length);
        }));
    });
});
