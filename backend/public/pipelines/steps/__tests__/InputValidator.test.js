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
const InputValidator_1 = require("../InputValidator");
const PipelineTypes_1 = require("../../types/PipelineTypes");
const constants_1 = require("../../../lib/constants");
const fixtures_1 = require("../../../lib/fixtures");
describe('InputValidatorStep', () => {
    let validator;
    let validContext;
    beforeEach(() => {
        validator = new InputValidator_1.InputValidatorStep(PipelineTypes_1.ContentType.SONG);
        validContext = {
            rawInput: fixtures_1.inputValidatorFixtures.validSongInput,
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
        it('should process valid input successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield validator.process(validContext);
            expect(result.sentences.raw).toEqual([validContext.rawInput.lyrics]);
        }));
        it('should throw error for unsupported content type', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidValidator = new InputValidator_1.InputValidatorStep('INVALID');
            yield expect(invalidValidator.process(validContext)).rejects.toThrow('Unsupported content type');
        }));
    });
    describe('input validation', () => {
        it('should throw error when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidContext = Object.assign(Object.assign({}, validContext), { rawInput: fixtures_1.inputValidatorFixtures.invalidInputs.emptyInterpreter });
            yield expect(validator.process(invalidContext)).rejects.toThrow(constants_1.errors.invalidData);
        }));
        it('should throw error for invalid spotify URL format', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidContext = Object.assign(Object.assign({}, validContext), { rawInput: Object.assign(Object.assign({}, validContext.rawInput), { spotify: 'invalid-url' }) });
            yield expect(validator.process(invalidContext)).rejects.toThrow('Invalid spotify URL format');
        }));
        it('should throw error for invalid genre format', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidContext = Object.assign(Object.assign({}, validContext), { rawInput: Object.assign(Object.assign({}, validContext.rawInput), { genre: 'pop' }) });
            yield expect(validator.process(invalidContext)).rejects.toThrow(constants_1.errors.invalidData);
        }));
        it('should throw error for invalid data types', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidContext = Object.assign(Object.assign({}, validContext), { rawInput: Object.assign(Object.assign({}, validContext.rawInput), { interpreter: 123 }) });
            yield expect(validator.process(invalidContext)).rejects.toThrow(constants_1.errors.invalidTextData);
        }));
    });
    describe('edge cases', () => {
        it('should reject empty lyrics as invalid data', () => __awaiter(void 0, void 0, void 0, function* () {
            const contextWithEmptyLyrics = Object.assign(Object.assign({}, validContext), { rawInput: Object.assign(Object.assign({}, validContext.rawInput), { lyrics: '' }) });
            yield expect(validator.process(contextWithEmptyLyrics)).rejects.toThrow(constants_1.errors.invalidData);
        }));
        it('should accept valid spotify URLs with different formats', () => __awaiter(void 0, void 0, void 0, function* () {
            const validspotifyUrls = [
                'https://spotify.com/watch?v=dQw4w9WgXcQ',
                'https://www.spotify.com/watch?v=dQw4w9WgXcQ',
            ];
            for (const url of validspotifyUrls) {
                const context = Object.assign(Object.assign({}, validContext), { rawInput: Object.assign(Object.assign({}, validContext.rawInput), { spotify: url }) });
                const result = yield validator.process(context);
                expect(result.sentences.raw).toEqual([context.rawInput.lyrics]);
            }
        }));
    });
});
