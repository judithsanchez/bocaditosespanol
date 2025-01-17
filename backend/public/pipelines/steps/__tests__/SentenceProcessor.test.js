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
const SentenceProcessor_1 = require("../SentenceProcessor");
const fixtures_1 = require("../../../lib/fixtures");
describe('SentenceProcessorStep', () => {
    let processor;
    let context;
    beforeEach(() => {
        processor = new SentenceProcessor_1.SentenceProcessorStep();
        context = {
            rawInput: {
                interpreter: 'Test Artist',
                title: 'Test Song',
                lyrics: fixtures_1.splitParagraphFixtures.spanishSentences.input,
                spotify: 'https://spotify.com/test',
                genre: ['test'],
                language: 'es',
                releaseDate: '2023-01-01',
            },
            sentences: {
                raw: [],
                formatted: [],
                originalSentencesIds: [],
                deduplicated: [],
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
        it('successfully splits Spanish sentences with punctuation', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield processor.process(context);
            expect(result.sentences.raw).toEqual(fixtures_1.splitParagraphFixtures.spanishSentences.expected);
        }));
        it('correctly formats sentences with IDs', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield processor.process(context);
            expect(result.sentences.formatted).toHaveLength(fixtures_1.splitParagraphFixtures.spanishSentences.expected.length);
            result.sentences.formatted.forEach(sentence => {
                expect(sentence).toMatchObject({
                    sentenceId: expect.stringContaining('test-song-test-artist'),
                    content: expect.any(String),
                    translations: {
                        english: {
                            literal: '',
                            contextual: '',
                        },
                    },
                    tokenIds: [],
                });
            });
        }));
        it('handles sentences with special characters correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            context.rawInput.lyrics = fixtures_1.splitParagraphFixtures.specialCharacters.input;
            const result = yield processor.process(context);
            expect(result.sentences.raw).toEqual(fixtures_1.splitParagraphFixtures.specialCharacters.expected);
        }));
        it('deduplicates identical sentences while preserving order', () => __awaiter(void 0, void 0, void 0, function* () {
            context.rawInput.lyrics = 'Hola mundo. Adiós mundo. Hola mundo.';
            const result = yield processor.process(context);
            expect(result.sentences.deduplicated).toHaveLength(2);
            expect(result.sentences.formatted).toHaveLength(3);
            expect(result.sentences.originalSentencesIds).toHaveLength(3);
        }));
    });
});
