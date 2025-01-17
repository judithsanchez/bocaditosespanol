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
exports.SentenceProcessorStep = void 0;
const index_1 = require("../../utils/index");
const constants_1 = require("../../lib/constants");
class SentenceProcessorStep {
    constructor() {
        Object.defineProperty(this, "logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new index_1.Logger('SentenceProcessorStep')
        });
    }
    process(context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.start('process');
            context.sentences.raw = this.splitParagraph(context.rawInput.lyrics);
            context.sentences.formatted = this.formatSentences({
                sentences: context.sentences.raw,
                author: context.rawInput.interpreter,
                title: context.rawInput.title,
            });
            context.sentences.originalSentencesIds = context.sentences.formatted.map(s => s.sentenceId);
            const seen = new Set();
            context.sentences.deduplicated = context.sentences.formatted.filter(sentence => {
                const isDuplicate = seen.has(sentence.content);
                seen.add(sentence.content);
                return !isDuplicate;
            });
            this.logger.info('Sentence processing completed', {
                rawCount: context.sentences.raw.length,
                formattedCount: context.sentences.formatted.length,
                deduplicatedCount: context.sentences.deduplicated.length,
            });
            this.logger.end('process');
            return context;
        });
    }
    splitParagraph(text) {
        if (typeof text !== 'string') {
            throw new TypeError(constants_1.errors.mustBeString);
        }
        const normalizedText = text.replace(/\s+/g, ' ').replace(/[\n\r]+/g, ' ');
        const sentenceEndRegex = /(?:[.!?]|\.{3})(?:\s+|$)/g;
        const sentences = [];
        let lastIndex = 0;
        for (const match of normalizedText.matchAll(sentenceEndRegex)) {
            if (match.index !== undefined) {
                const sentence = normalizedText
                    .slice(lastIndex, match.index + match[0].length)
                    .trim();
                if (sentence) {
                    sentences.push(sentence);
                }
                lastIndex = match.index + match[0].length;
            }
        }
        const remainingText = normalizedText.slice(lastIndex).trim();
        if (remainingText) {
            sentences.push(remainingText);
        }
        return sentences;
    }
    formatSentences({ sentences, author, title, }) {
        const sentenceMap = new Map();
        return sentences.map(sentence => {
            if (!sentenceMap.has(sentence)) {
                sentenceMap.set(sentence, sentenceMap.size + 1);
            }
            const sentenceNumber = sentenceMap.get(sentence);
            return {
                sentenceId: `sentence-${sentenceNumber}-${title
                    .toLowerCase()
                    .replace(/\s+/g, '-')}-${author.toLowerCase().replace(/\s+/g, '-')}`,
                content: sentence,
                translations: {
                    english: {
                        literal: '',
                        contextual: '',
                    },
                },
                tokenIds: [],
            };
        });
    }
}
exports.SentenceProcessorStep = SentenceProcessorStep;
