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
exports.SongProcessingPipeline = void 0;
const Pipeline_1 = require("./Pipeline");
const PipelineTypes_1 = require("./types/PipelineTypes");
const DatabaseService_1 = require("../services/DatabaseService");
const index_1 = require("./steps/index");
class SongProcessingPipeline extends Pipeline_1.Pipeline {
    constructor() {
        super({
            name: 'SongProcessing',
            stopOnError: true,
        }, [
            new index_1.InputValidatorStep(PipelineTypes_1.ContentType.SONG),
            new index_1.SentenceProcessorStep(),
            new index_1.TokenProcessorStep(),
            new index_1.SentenceEnricherSteps(),
            new index_1.BasicEnricherStep(),
            new index_1.SpecializedEnricherStep(),
        ]);
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new DatabaseService_1.DatabaseService()
        });
    }
    static createContext(input) {
        return {
            rawInput: input,
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
    }
    processText(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = SongProcessingPipeline.createContext(input);
            const processedContext = yield this.process(context);
            processedContext.song = {
                songId: `${input.title
                    .toLowerCase()
                    .replace(/\s+/g, '-')}-${input.interpreter
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`,
                metadata: {
                    interpreter: input.interpreter,
                    feat: input.feat,
                    title: input.title,
                    spotify: input.spotify,
                    genre: input.genre,
                    language: input.language,
                    releaseDate: input.releaseDate,
                },
                lyrics: processedContext.sentences.formatted.map(s => s.sentenceId),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            yield this.db.saveSentences(processedContext.sentences.enriched, {
                title: input.title,
                interpreter: input.interpreter,
            });
            yield this.db.saveTextEntry(processedContext.song, 'song');
            yield this.db.saveTokens(processedContext.tokens.enriched);
            return processedContext;
        });
    }
}
exports.SongProcessingPipeline = SongProcessingPipeline;
