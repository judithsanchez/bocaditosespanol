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
exports.InputValidatorStep = void 0;
const constants_1 = require("../../lib/constants");
const index_1 = require("../../utils/index");
const PipelineTypes_1 = require("../types/PipelineTypes");
class InputValidatorStep {
    constructor(contentType) {
        Object.defineProperty(this, "contentType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: contentType
        });
        Object.defineProperty(this, "logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.logger = new index_1.Logger('InputValidatorStep');
    }
    process(context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.start('process');
            switch (this.contentType) {
                case PipelineTypes_1.ContentType.SONG:
                    this.validateSongInput(context.rawInput);
                    break;
                default:
                    throw new Error('Unsupported content type');
            }
            context.sentences.raw = [context.rawInput.lyrics];
            this.logger.end('process');
            return context;
        });
    }
    validateSongInput(input) {
        if (!this.validateRequiredFields(input)) {
            throw new Error(constants_1.errors.invalidData);
        }
        this.validateDataTypes(input);
        this.logger.info('Input validation completed', {
            title: input.title,
            interpreter: input.interpreter,
            lyricsLength: input.lyrics.length,
        });
    }
    validateRequiredFields(input) {
        return !!(input.interpreter &&
            input.title &&
            input.spotify &&
            input.genre &&
            input.language &&
            input.releaseDate &&
            input.lyrics);
    }
    validateDataTypes(input) {
        if (typeof input.interpreter !== 'string' ||
            typeof input.title !== 'string' ||
            typeof input.spotify !== 'string' ||
            typeof input.language !== 'string' ||
            typeof input.lyrics !== 'string') {
            throw new Error(constants_1.errors.invalidTextData);
        }
        if (!Array.isArray(input.genre)) {
            throw new Error(constants_1.errors.invalidData);
        }
        const spotifyUrlPattern = /^https:\/\/(www\.)?spotify\.com\/watch\?v=[\w-]+/;
        if (!spotifyUrlPattern.test(input.spotify)) {
            throw new Error('Invalid spotify URL format');
        }
    }
}
exports.InputValidatorStep = InputValidatorStep;
