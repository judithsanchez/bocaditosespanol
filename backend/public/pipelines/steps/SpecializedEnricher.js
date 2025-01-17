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
exports.SpecializedEnricherStep = void 0;
const types_1 = require("../../lib/types");
const index_1 = require("../../utils/index");
class SpecializedEnricherStep {
    constructor() {
        Object.defineProperty(this, "logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new index_1.Logger('SpecializedEnricherStep')
        });
        Object.defineProperty(this, "lastProcessingTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    enforceRateLimit() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = Date.now();
            const timeSinceLastProcess = now - this.lastProcessingTime;
            if (timeSinceLastProcess <
                SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES) {
                const waitTime = SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES -
                    timeSinceLastProcess;
                yield new Promise(resolve => setTimeout(resolve, waitTime));
            }
            this.lastProcessingTime = Date.now();
        });
    }
    process(context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.start('process');
            const enrichedTokens = context.tokens.enriched;
            const enrichmentQueue = [
                {
                    type: types_1.PartOfSpeech.Verb,
                    tokens: this.filterTokensByType(enrichedTokens, types_1.PartOfSpeech.Verb),
                    fn: index_1.enrichVerbTokens,
                },
                {
                    type: types_1.PartOfSpeech.Noun,
                    tokens: this.filterTokensByType(enrichedTokens, types_1.PartOfSpeech.Noun),
                    fn: index_1.enrichNounTokens,
                },
                {
                    type: types_1.PartOfSpeech.Adjective,
                    tokens: this.filterTokensByType(enrichedTokens, types_1.PartOfSpeech.Adjective),
                    fn: index_1.enrichAdjectiveTokens,
                },
                {
                    type: types_1.PartOfSpeech.Adverb,
                    tokens: this.filterTokensByType(enrichedTokens, types_1.PartOfSpeech.Adverb),
                    fn: index_1.enrichAdverbTokens,
                },
                {
                    type: types_1.PartOfSpeech.Article,
                    tokens: this.filterTokensByType(enrichedTokens, types_1.PartOfSpeech.Article),
                    fn: index_1.enrichArticleTokens,
                },
                {
                    type: types_1.PartOfSpeech.Conjunction,
                    tokens: this.filterTokensByType(enrichedTokens, types_1.PartOfSpeech.Conjunction),
                    fn: index_1.enrichConjunctionTokens,
                },
                {
                    type: types_1.PartOfSpeech.Determiner,
                    tokens: this.filterTokensByType(enrichedTokens, types_1.PartOfSpeech.Determiner),
                    fn: index_1.enrichDeterminerTokens,
                },
                {
                    type: types_1.PartOfSpeech.Interjection,
                    tokens: this.filterTokensByType(enrichedTokens, types_1.PartOfSpeech.Interjection),
                    fn: index_1.enrichInterjectionTokens,
                },
                {
                    type: types_1.PartOfSpeech.Numeral,
                    tokens: this.filterTokensByType(enrichedTokens, types_1.PartOfSpeech.Numeral),
                    fn: index_1.enrichNumeralTokens,
                },
                {
                    type: types_1.PartOfSpeech.Preposition,
                    tokens: this.filterTokensByType(enrichedTokens, types_1.PartOfSpeech.Preposition),
                    fn: index_1.enrichPrepositionTokens,
                },
                {
                    type: types_1.PartOfSpeech.Pronoun,
                    tokens: this.filterTokensByType(enrichedTokens, types_1.PartOfSpeech.Pronoun),
                    fn: index_1.enrichPronounTokens,
                },
            ];
            const results = [];
            for (const { type, tokens, fn } of enrichmentQueue) {
                if (tokens.length === 0) {
                    results.push({ type, enriched: [] });
                    continue;
                }
                yield this.enforceRateLimit();
                const simplifiedTokens = tokens.map(token => ({
                    tokenId: token.tokenId,
                    content: token.content,
                    grammaticalInfo: token.grammaticalInfo,
                }));
                const enriched = yield (0, index_1.batchProcessor)({
                    items: simplifiedTokens,
                    processingFn: fn,
                    batchSize: SpecializedEnricherStep.RATE_LIMITS.BATCH_SIZE,
                    options: {
                        retryAttempts: SpecializedEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
                        delayBetweenBatches: SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
                        maxRequestsPerMinute: SpecializedEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
                    },
                });
                const processedTokens = tokens.map(originalToken => {
                    var _a;
                    return (Object.assign(Object.assign({}, originalToken), { grammaticalInfo: ((_a = enriched.find(t => t.tokenId === originalToken.tokenId)) === null || _a === void 0 ? void 0 : _a.grammaticalInfo) || originalToken.grammaticalInfo }));
                });
                results.push({ type, enriched: processedTokens });
            }
            const processedTokens = results.reduce((acc, { enriched }) => [...acc, ...enriched], []);
            context.tokens.enriched = [
                ...processedTokens,
                ...enrichedTokens.filter(token => token.tokenType !== types_1.TokenType.Word ||
                    !enrichmentQueue
                        .map(q => q.type)
                        .includes(token.partOfSpeech)),
            ];
            this.logger.info('Specialized enrichment completed', Object.assign({ totalTokens: context.tokens.enriched.length }, results.reduce((acc, { type, enriched }) => (Object.assign(Object.assign({}, acc), { [`enriched${type}s`]: enriched.length })), {})));
            this.logger.end('process');
            return context;
        });
    }
    filterTokensByType(enrichedTokens, partOfSpeech) {
        return enrichedTokens.filter((token) => token.tokenType === types_1.TokenType.Word &&
            token.partOfSpeech === partOfSpeech);
    }
}
exports.SpecializedEnricherStep = SpecializedEnricherStep;
Object.defineProperty(SpecializedEnricherStep, "RATE_LIMITS", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: {
        BATCH_SIZE: 10,
        RETRY_ATTEMPTS: 3,
        DELAY_BETWEEN_BATCHES: 6000,
        REQUESTS_PER_MINUTE: 1,
    }
});
// import {PipelineStep} from '../Pipeline';
// import {SongProcessingContext} from '../SongProcessingPipeline';
// import {
// 	TokenType,
// 	PartOfSpeech,
// 	IWord,
// 	IPunctuationSign,
// 	IEmoji,
// } from '../../lib/types';
// import {
// 	batchProcessor,
// 	enrichVerbTokens,
// 	enrichNounTokens,
// 	enrichAdjectiveTokens,
// 	enrichAdverbTokens,
// 	enrichArticleTokens,
// 	Logger,
// 	enrichPronounTokens,
// 	enrichConjunctionTokens,
// 	enrichDeterminerTokens,
// 	enrichInterjectionTokens,
// 	enrichNumeralTokens,
// 	enrichPrepositionTokens,
// } from '../../utils/index';
// export class SpecializedEnricherStep
// 	implements PipelineStep<SongProcessingContext>
// {
// 	private static readonly RATE_LIMITS = {
// 		BATCH_SIZE: 10,
// 		RETRY_ATTEMPTS: 3,
// 		DELAY_BETWEEN_BATCHES: 6000,
// 		REQUESTS_PER_MINUTE: 1,
// 	};
// 	private readonly logger = new Logger('SpecializedEnricherStep');
// 	private async processTokensByType<T extends IWord>(
// 		tokens: T[],
// 		enrichmentFunction: (
// 			items: Array<{
// 				tokenId: string;
// 				content: string;
// 				grammaticalInfo: any;
// 			}>,
// 		) => Promise<any[]>,
// 	): Promise<T[]> {
// 		if (!tokens.length) return [];
// 		const simplifiedTokens = tokens.map(token => ({
// 			tokenId: token.tokenId,
// 			content: token.content,
// 			grammaticalInfo: token.grammaticalInfo,
// 		}));
// 		const enrichedTokens = await batchProcessor({
// 			items: simplifiedTokens,
// 			processingFn: enrichmentFunction,
// 			batchSize: SpecializedEnricherStep.RATE_LIMITS.BATCH_SIZE,
// 			options: {
// 				retryAttempts: SpecializedEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
// 				delayBetweenBatches:
// 					SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
// 				maxRequestsPerMinute:
// 					SpecializedEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
// 			},
// 		});
// 		return tokens.map(originalToken => ({
// 			...originalToken,
// 			grammaticalInfo:
// 				enrichedTokens.find(t => t.tokenId === originalToken.tokenId)
// 					?.grammaticalInfo || originalToken.grammaticalInfo,
// 		}));
// 	}
// 	async process(
// 		context: SongProcessingContext,
// 	): Promise<SongProcessingContext> {
// 		this.logger.start('process');
// 		const enrichedTokens = context.tokens.enriched;
// 		const processingMap = {
// 			[PartOfSpeech.Verb]: {
// 				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Verb),
// 				fn: enrichVerbTokens,
// 			},
// 			[PartOfSpeech.Noun]: {
// 				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Noun),
// 				fn: enrichNounTokens,
// 			},
// 			[PartOfSpeech.Adjective]: {
// 				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Adjective),
// 				fn: enrichAdjectiveTokens,
// 			},
// 			[PartOfSpeech.Adverb]: {
// 				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Adverb),
// 				fn: enrichAdverbTokens,
// 			},
// 			[PartOfSpeech.Article]: {
// 				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Article),
// 				fn: enrichArticleTokens,
// 			},
// 			[PartOfSpeech.Conjunction]: {
// 				tokens: this.filterTokensByType(
// 					enrichedTokens,
// 					PartOfSpeech.Conjunction,
// 				),
// 				fn: enrichConjunctionTokens,
// 			},
// 			[PartOfSpeech.Determiner]: {
// 				tokens: this.filterTokensByType(
// 					enrichedTokens,
// 					PartOfSpeech.Determiner,
// 				),
// 				fn: enrichDeterminerTokens,
// 			},
// 			[PartOfSpeech.Interjection]: {
// 				tokens: this.filterTokensByType(
// 					enrichedTokens,
// 					PartOfSpeech.Interjection,
// 				),
// 				fn: enrichInterjectionTokens,
// 			},
// 			[PartOfSpeech.Numeral]: {
// 				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Numeral),
// 				fn: enrichNumeralTokens,
// 			},
// 			[PartOfSpeech.Preposition]: {
// 				tokens: this.filterTokensByType(
// 					enrichedTokens,
// 					PartOfSpeech.Preposition,
// 				),
// 				fn: enrichPrepositionTokens,
// 			},
// 			[PartOfSpeech.Pronoun]: {
// 				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Pronoun),
// 				fn: enrichPronounTokens,
// 			},
// 		};
// 		// Process all token types in parallel
// 		const results = await Promise.all(
// 			Object.entries(processingMap).map(async ([type, {tokens, fn}]) => ({
// 				type,
// 				enriched: await this.processTokensByType(tokens, fn),
// 			})),
// 		);
// 		// Combine all enriched tokens
// 		const processedTokens = results.reduce(
// 			(acc, {enriched}) => [...acc, ...enriched],
// 			[] as IWord[],
// 		);
// 		// Add back non-word tokens
// 		context.tokens.enriched = [
// 			...processedTokens,
// 			...enrichedTokens.filter(
// 				token =>
// 					token.tokenType !== TokenType.Word ||
// 					!Object.keys(processingMap).includes(token.partOfSpeech as string),
// 			),
// 		];
// 		this.logger.info('Specialized enrichment completed', {
// 			totalTokens: context.tokens.enriched.length,
// 			...results.reduce(
// 				(acc, {type, enriched}) => ({
// 					...acc,
// 					[`enriched${type}s`]: enriched.length,
// 				}),
// 				{},
// 			),
// 		});
// 		this.logger.end('process');
// 		return context;
// 	}
// 	filterTokensByType(
// 		enrichedTokens: (IWord | IPunctuationSign | IEmoji)[],
// 		partOfSpeech: PartOfSpeech,
// 	): IWord[] {
// 		return enrichedTokens.filter(
// 			(token): token is IWord =>
// 				token.tokenType === TokenType.Word &&
// 				token.partOfSpeech === partOfSpeech,
// 		);
// 	}
// }
