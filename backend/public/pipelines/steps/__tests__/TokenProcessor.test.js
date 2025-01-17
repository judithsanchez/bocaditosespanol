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
const TokenProcessor_1 = require("../TokenProcessor");
const fixtures_1 = require("../../../lib/fixtures");
describe('TokenProcessorStep', () => {
    let processor;
    let context;
    beforeEach(() => {
        processor = new TokenProcessor_1.TokenProcessorStep();
        context = {
            rawInput: {},
            sentences: {
                raw: [],
                formatted: [...fixtures_1.tokenProcessorFixtures.basicContext.sentences.formatted],
                originalSentencesIds: [],
                deduplicated: [
                    ...fixtures_1.tokenProcessorFixtures.basicContext.sentences.deduplicated,
                ],
                enriched: [],
            },
            tokens: {
                all: [],
                words: [],
                deduplicated: [],
                enriched: [],
            },
            song: {},
        };
    });
    describe('process', () => {
        it('should process basic sentences correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield processor.process(context);
            expect(result.tokens.all).toHaveLength(3);
            expect(result.sentences.formatted[0].tokenIds).toHaveLength(3);
        }));
        it('should handle sentences with emojis', () => __awaiter(void 0, void 0, void 0, function* () {
            context.sentences.formatted[0].content =
                fixtures_1.tokenProcessorFixtures.tokenizationCases.withEmojis.input;
            context.sentences.deduplicated[0].content =
                fixtures_1.tokenProcessorFixtures.tokenizationCases.withEmojis.input;
            const result = yield processor.process(context);
            expect(result.tokens.all).toHaveLength(5);
            expect(result.tokens.all.filter(t => t.tokenType === 'emoji')).toHaveLength(2);
        }));
        it('should process special characters correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            context.sentences.formatted[0].content =
                fixtures_1.tokenProcessorFixtures.tokenizationCases.withSpecialChars.input;
            context.sentences.deduplicated[0].content =
                fixtures_1.tokenProcessorFixtures.tokenizationCases.withSpecialChars.input;
            const result = yield processor.process(context);
            const specialCharWords = result.tokens.all.filter(t => t.tokenType === 'word' && t.hasSpecialChar);
            expect(specialCharWords).toHaveLength(1);
        }));
        it('should maintain token references in deduplicated sentences', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield processor.process(context);
            expect(result.sentences.formatted[0].tokenIds).toEqual(result.sentences.deduplicated[0].tokenIds);
        }));
    });
});
