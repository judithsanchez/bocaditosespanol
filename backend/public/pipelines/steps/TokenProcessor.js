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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenProcessorStep = void 0;
const emoji_regex_1 = __importDefault(require("emoji-regex"));
const types_1 = require("../../lib/types");
const index_1 = require("../../utils/index");
class TokenProcessorStep {
    constructor() {
        Object.defineProperty(this, "logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new index_1.Logger('TokenProcessorStep')
        });
    }
    process(context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.start('process');
            const processedSentences = context.sentences.formatted.map(sentence => {
                const tokens = this.tokenizeSentence(sentence.content);
                context.tokens.all.push(...tokens);
                return Object.assign(Object.assign({}, sentence), { tokenIds: tokens.map(token => token.tokenId) });
            });
            context.sentences.formatted = processedSentences;
            context.sentences.deduplicated = context.sentences.deduplicated.map(sentence => {
                const matchingSentence = processedSentences.find(processed => processed.content === sentence.content);
                return Object.assign(Object.assign({}, sentence), { tokenIds: (matchingSentence === null || matchingSentence === void 0 ? void 0 : matchingSentence.tokenIds) || [] });
            });
            this.logger.info('Token processing completed', {
                totalTokens: context.tokens.all.length,
                wordTokens: context.tokens.all.filter(t => t.tokenType === types_1.TokenType.Word)
                    .length,
                punctuationTokens: context.tokens.all.filter(t => t.tokenType === types_1.TokenType.PunctuationSign).length,
                emojiTokens: context.tokens.all.filter(t => t.tokenType === types_1.TokenType.Emoji).length,
            });
            this.logger.end('process');
            return context;
        });
    }
    tokenizeSentence(content) {
        const trimmedContent = content.trim().replace(/\s+/g, ' ');
        const emojiPattern = (0, emoji_regex_1.default)();
        const pattern = `(${emojiPattern.source}|\\.{3}|[.?!¡¿,:;'"\\s-])`;
        const regex = new RegExp(pattern, 'gu');
        return trimmedContent
            .split(regex)
            .filter(token => token.trim() !== '')
            .map(token => this.createToken(token));
    }
    createToken(token) {
        if ((0, emoji_regex_1.default)().test(token)) {
            return {
                tokenId: `token-${token}`,
                content: token,
                tokenType: types_1.TokenType.Emoji,
            };
        }
        if (/^[.?!¡¿,:;'"\\s-]+$/.test(token)) {
            return {
                tokenId: `token-${token}`,
                content: token,
                tokenType: types_1.TokenType.PunctuationSign,
            };
        }
        return {
            tokenId: `token-${token.toLowerCase()}`,
            content: token,
            normalizedToken: token.toLowerCase(),
            tokenType: types_1.TokenType.Word,
            translations: { english: [] },
            hasSpecialChar: /[áéíóúüñ]/i.test(token),
            partOfSpeech: '',
            isSlang: false,
            isCognate: false,
            isFalseCognate: false,
        };
    }
}
exports.TokenProcessorStep = TokenProcessorStep;
