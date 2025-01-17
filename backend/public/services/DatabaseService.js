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
exports.DatabaseService = void 0;
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const path_1 = require("path");
const types_1 = require("../lib/types");
class DatabaseService {
    constructor() {
        Object.defineProperty(this, "dbPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (0, path_1.join)(__dirname, '..', '..', process.env.NODE_ENV === 'production' ? 'dist/data' : 'src/data')
        });
        Object.defineProperty(this, "tokens", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                words: {
                    nouns: {},
                    verbs: {},
                    adjectives: {},
                    adverbs: {},
                    pronouns: {},
                    determiners: {},
                    articles: {},
                    prepositions: {},
                    conjunctions: {},
                    interjections: {},
                    numerals: {},
                },
                punctuationSigns: {},
                emojis: {},
            }
        });
        console.log('Database path:', this.dbPath);
        this.initializeDataStructures();
    }
    initializeDataStructures() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, fs_1.existsSync)(this.dbPath)) {
                yield (0, promises_1.mkdir)(this.dbPath, { recursive: true });
            }
        });
    }
    saveTextEntry(entry, contentType) {
        return __awaiter(this, void 0, void 0, function* () {
            const entries = (yield this.readFile('text-entries.json')) || {};
            if (!entries[contentType]) {
                entries[contentType] = [];
            }
            entries[contentType].push(entry);
            yield this.writeFile('text-entries.json', entries);
        });
    }
    saveSentences(sentences, songMetadata) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingSentences = (yield this.readFile('sentences.json')) || {};
            const songKey = `${songMetadata.title
                .toLowerCase()
                .replace(/\s+/g, '-')}-${songMetadata.interpreter
                .toLowerCase()
                .replace(/\s+/g, '-')}`;
            existingSentences[songKey] = sentences;
            yield this.writeFile('sentences.json', existingSentences);
        });
    }
    saveTokens(tokens) {
        return __awaiter(this, void 0, void 0, function* () {
            let currentTokens = yield this.readFile('tokens.json');
            if (!currentTokens) {
                currentTokens = {
                    words: {
                        nouns: {},
                        verbs: {},
                        adjectives: {},
                        adverbs: {},
                        pronouns: {},
                        determiners: {},
                        articles: {},
                        prepositions: {},
                        conjunctions: {},
                        interjections: {},
                        numerals: {},
                    },
                    punctuationSigns: {},
                    emojis: {},
                };
            }
            this.tokens = currentTokens;
            for (const token of tokens) {
                yield this.addToken(token);
            }
            yield this.writeFile('tokens.json', this.tokens);
        });
    }
    addToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const { category, subcategory, token: processedToken, } = this.categorizeToken(token);
            if (subcategory) {
                if (!this.tokens[category][subcategory]) {
                    this.tokens[category][subcategory] = {};
                }
                this.tokens[category][subcategory][token.tokenId] = processedToken;
            }
            else {
                if (!this.tokens[category]) {
                    this.tokens[category] = {};
                }
                this.tokens[category][token.tokenId] = processedToken;
            }
        });
    }
    categorizeToken(token) {
        const partOfSpeechMap = {
            noun: 'nouns',
            verb: 'verbs',
            adjective: 'adjectives',
            adverb: 'adverbs',
            pronoun: 'pronouns',
            determiner: 'determiners',
            article: 'articles',
            preposition: 'prepositions',
            conjunction: 'conjunctions',
            interjection: 'interjections',
            numeral: 'numerals',
        };
        if (token.tokenType === types_1.TokenType.Word) {
            const wordToken = token;
            const subcategory = partOfSpeechMap[wordToken.partOfSpeech];
            return {
                category: 'words',
                subcategory,
                token,
            };
        }
        return {
            category: token.tokenType === types_1.TokenType.PunctuationSign
                ? 'punctuationSigns'
                : 'emojis',
            token,
        };
    }
    getTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            const tokens = yield this.readFile('tokens.json');
            if (!tokens)
                return [];
            const allTokens = [];
            const wordCategories = tokens.words;
            Object.values(wordCategories).forEach(category => {
                allTokens.push(...Object.values(category));
            });
            const punctuationSigns = tokens.punctuationSigns;
            const emojis = tokens.emojis;
            allTokens.push(...Object.values(punctuationSigns));
            allTokens.push(...Object.values(emojis));
            return allTokens;
        });
    }
    readFile(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filePath = (0, path_1.join)(this.dbPath, filename);
                console.log('Attempting to read file:', filePath);
                const content = yield (0, promises_1.readFile)(filePath, 'utf-8');
                console.log('File content:', content);
                return JSON.parse(content);
            }
            catch (error) {
                console.log('Error reading file:', error);
                return null;
            }
        });
    }
    writeFile(filename, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, promises_1.writeFile)((0, path_1.join)(this.dbPath, filename), JSON.stringify(data, null, 2));
        });
    }
}
exports.DatabaseService = DatabaseService;
