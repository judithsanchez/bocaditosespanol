import {PipelineStep} from '../Pipeline';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {
	TokenType,
	PartOfSpeech,
	IWord,
	IPunctuationSign,
	IEmoji,
} from '../../lib/types';
import {
	batchProcessor,
	enrichVerbTokens,
	enrichNounTokens,
	enrichAdjectiveTokens,
	enrichAdverbTokens,
	enrichArticleTokens,
	Logger,
	enrichPronounTokens,
	enrichConjunctionTokens,
	enrichDeterminerTokens,
	enrichInterjectionTokens,
	enrichNumeralTokens,
	enrichPrepositionTokens,
} from '../../utils/index';

export class SpecializedEnricherStep
	implements PipelineStep<SongProcessingContext>
{
	private static readonly RATE_LIMITS = {
		BATCH_SIZE: 10,
		RETRY_ATTEMPTS: 3,
		DELAY_BETWEEN_BATCHES: 6000,
		REQUESTS_PER_MINUTE: 1,
	};

	private readonly logger = new Logger('SpecializedEnricherStep');

	private async processTokensByType<T extends IWord>(
		tokens: T[],
		enrichmentFunction: (
			items: Array<{
				tokenId: string;
				originalText: string;
				grammaticalInfo: any;
			}>,
		) => Promise<any[]>,
	): Promise<T[]> {
		if (!tokens.length) return [];

		const simplifiedTokens = tokens.map(token => ({
			tokenId: token.tokenId,
			originalText: token.originalText,
			grammaticalInfo: token.grammaticalInfo,
		}));

		const enrichedTokens = await batchProcessor({
			items: simplifiedTokens,
			processingFn: enrichmentFunction,
			batchSize: SpecializedEnricherStep.RATE_LIMITS.BATCH_SIZE,
			options: {
				retryAttempts: SpecializedEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
				delayBetweenBatches:
					SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
				maxRequestsPerMinute:
					SpecializedEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
			},
		});

		return tokens.map(originalToken => ({
			...originalToken,
			grammaticalInfo:
				enrichedTokens.find(t => t.tokenId === originalToken.tokenId)
					?.grammaticalInfo || originalToken.grammaticalInfo,
		}));
	}

	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');
		const enrichedTokens = context.tokens.enriched;

		const processingMap = {
			[PartOfSpeech.Verb]: {
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Verb),
				fn: enrichVerbTokens,
			},
			[PartOfSpeech.Noun]: {
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Noun),
				fn: enrichNounTokens,
			},
			[PartOfSpeech.Adjective]: {
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Adjective),
				fn: enrichAdjectiveTokens,
			},
			[PartOfSpeech.Adverb]: {
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Adverb),
				fn: enrichAdverbTokens,
			},
			[PartOfSpeech.Article]: {
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Article),
				fn: enrichArticleTokens,
			},
			[PartOfSpeech.Conjunction]: {
				tokens: this.filterTokensByType(
					enrichedTokens,
					PartOfSpeech.Conjunction,
				),
				fn: enrichConjunctionTokens,
			},
			[PartOfSpeech.Determiner]: {
				tokens: this.filterTokensByType(
					enrichedTokens,
					PartOfSpeech.Determiner,
				),
				fn: enrichDeterminerTokens,
			},
			[PartOfSpeech.Interjection]: {
				tokens: this.filterTokensByType(
					enrichedTokens,
					PartOfSpeech.Interjection,
				),
				fn: enrichInterjectionTokens,
			},
			[PartOfSpeech.Numeral]: {
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Numeral),
				fn: enrichNumeralTokens,
			},
			[PartOfSpeech.Preposition]: {
				tokens: this.filterTokensByType(
					enrichedTokens,
					PartOfSpeech.Preposition,
				),
				fn: enrichPrepositionTokens,
			},
			[PartOfSpeech.Pronoun]: {
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Pronoun),
				fn: enrichPronounTokens,
			},
		};

		// Process all token types in parallel
		const results = await Promise.all(
			Object.entries(processingMap).map(async ([type, {tokens, fn}]) => ({
				type,
				enriched: await this.processTokensByType(tokens, fn),
			})),
		);

		// Combine all enriched tokens
		const processedTokens = results.reduce(
			(acc, {enriched}) => [...acc, ...enriched],
			[] as IWord[],
		);

		// Add back non-word tokens
		context.tokens.enriched = [
			...processedTokens,
			...enrichedTokens.filter(
				token =>
					token.tokenType !== TokenType.Word ||
					!Object.keys(processingMap).includes(token.partOfSpeech as string),
			),
		];

		this.logger.info('Specialized enrichment completed', {
			totalTokens: context.tokens.enriched.length,
			...results.reduce(
				(acc, {type, enriched}) => ({
					...acc,
					[`enriched${type}s`]: enriched.length,
				}),
				{},
			),
		});

		this.logger.end('process');
		return context;
	}
	filterTokensByType(
		enrichedTokens: (IWord | IPunctuationSign | IEmoji)[],
		partOfSpeech: PartOfSpeech,
	): IWord[] {
		return enrichedTokens.filter(
			(token): token is IWord =>
				token.tokenType === TokenType.Word &&
				token.partOfSpeech === partOfSpeech,
		);
	}
}

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

// 	async process(
// 		context: SongProcessingContext,
// 	): Promise<SongProcessingContext> {
// 		this.logger.start('process');

// 		const enrichedTokens = context.tokens.enriched;

// 		const verbTokens = this.filterTokensByType(
// 			enrichedTokens,
// 			PartOfSpeech.Verb,
// 		);
// 		const nounTokens = this.filterTokensByType(
// 			enrichedTokens,
// 			PartOfSpeech.Noun,
// 		);
// 		const adjectiveTokens = this.filterTokensByType(
// 			enrichedTokens,
// 			PartOfSpeech.Adjective,
// 		);
// 		const adverbTokens = this.filterTokensByType(
// 			enrichedTokens,
// 			PartOfSpeech.Adverb,
// 		);
// 		const articleTokens = this.filterTokensByType(
// 			enrichedTokens,
// 			PartOfSpeech.Article,
// 		);

// 		const conjunctionTokens = this.filterTokensByType(
// 			enrichedTokens,
// 			PartOfSpeech.Conjunction,
// 		);
// 		const determinerTokens = this.filterTokensByType(
// 			enrichedTokens,
// 			PartOfSpeech.Determiner,
// 		);
// 		const interjectionTokens = this.filterTokensByType(
// 			enrichedTokens,
// 			PartOfSpeech.Interjection,
// 		);
// 		const numeralTokens = this.filterTokensByType(
// 			enrichedTokens,
// 			PartOfSpeech.Numeral,
// 		);

// 		const prepositionTokens = this.filterTokensByType(
// 			enrichedTokens,
// 			PartOfSpeech.Preposition,
// 		);
// 		const pronounTokens = this.filterTokensByType(
// 			enrichedTokens,
// 			PartOfSpeech.Pronoun,
// 		);

// 		const [
// 			enrichedVerbs,
// 			enrichedNouns,
// 			enrichedAdjectives,
// 			enrichedAdverbs,
// 			enrichedArticles,
// 			enrichedConjunctions,
// 			enrichedDeterminers,
// 			enrichedInterjections,
// 			enrichedNumerals,
// 			enrichedPrepositions,
// 			enrichedPronouns,
// 		] = await Promise.all([
// 			this.processVerbTokens(verbTokens),
// 			this.processNounTokens(nounTokens),
// 			this.processAdjectiveTokens(adjectiveTokens),
// 			this.processAdverbTokens(adverbTokens),
// 			this.processArticleTokens(articleTokens),
// 			this.processConjunctionTokens(conjunctionTokens),
// 			this.processDeterminerTokens(determinerTokens),
// 			this.processInterjectionTokens(interjectionTokens),
// 			this.processNumeralTokens(numeralTokens),
// 			this.processPrepositionTokens(prepositionTokens),
// 			this.processPronounTokens(pronounTokens),
// 		]);

// 		context.tokens.enriched = [
// 			...enrichedVerbs,
// 			...enrichedNouns,
// 			...enrichedAdjectives,
// 			...enrichedAdverbs,
// 			...enrichedArticles,
// 			...enrichedConjunctions,
// 			...enrichedDeterminers,
// 			...enrichedInterjections,
// 			...enrichedNumerals,
// 			...enrichedPrepositions,
// 			...enrichedPronouns,
// 			...enrichedTokens.filter(
// 				// @ts-ignore
// 				token =>
// 					token.tokenType !== TokenType.Word ||
// 					![
// 						PartOfSpeech.Verb,
// 						PartOfSpeech.Noun,
// 						PartOfSpeech.Adjective,
// 						PartOfSpeech.Adverb,
// 						PartOfSpeech.Article,
// 						PartOfSpeech.Conjunction,
// 						PartOfSpeech.Determiner,
// 						PartOfSpeech.Interjection,
// 						PartOfSpeech.Numeral,
// 						PartOfSpeech.Preposition,
// 						PartOfSpeech.Pronoun,
// 						// @ts-ignore
// 					].includes((token as IWord).partOfSpeech),
// 			),
// 		];

// 		this.logger.info('Specialized enrichment completed', {
// 			totalTokens: context.tokens.enriched.length,
// 			enrichedVerbs: enrichedVerbs.length,
// 			enrichedNouns: enrichedNouns.length,
// 			enrichedAdjectives: enrichedAdjectives.length,
// 			enrichedAdverbs: enrichedAdverbs.length,
// 			enrichedArticles: enrichedArticles.length,
// 			enrichedConjunctions: enrichedConjunctions.length,
// 			enrichedDeterminers: enrichedDeterminers.length,
// 			enrichedInterjections: enrichedInterjections.length,
// 			enrichedNumerals: enrichedNumerals.length,
// 			enrichedPrepositions: enrichedPrepositions.length,
// 			enrichedPronouns: enrichedPronouns.length,
// 		});

// 		this.logger.end('process');
// 		return context;
// 	}
// 	private filterTokensByType(
// 		tokens: Array<IWord | IPunctuationSign | IEmoji>,
// 		partOfSpeech: PartOfSpeech,
// 	): IWord[] {
// 		return tokens.filter(
// 			(token): token is IWord =>
// 				token.tokenType === TokenType.Word &&
// 				token.partOfSpeech === partOfSpeech,
// 		);
// 	}

// 	private async processVerbTokens(verbs: IWord[]): Promise<IWord[]> {
// 		if (!verbs.length) return [];

// 		const simplifiedVerbs = verbs.map(token => ({
// 			tokenId: token.tokenId,
// 			originalText: token.originalText,
// 			grammaticalInfo: token.grammaticalInfo,
// 		}));

// 		const enrichedVerbs = await batchProcessor({
// 			items: simplifiedVerbs,
// 			processingFn: enrichVerbTokens,
// 			batchSize: SpecializedEnricherStep.RATE_LIMITS.BATCH_SIZE,
// 			options: {
// 				retryAttempts: SpecializedEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
// 				delayBetweenBatches:
// 					SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
// 				maxRequestsPerMinute:
// 					SpecializedEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
// 			},
// 		});

// 		return verbs.map(originalToken => ({
// 			...originalToken,
// 			grammaticalInfo:
// 				enrichedVerbs.find(t => t.tokenId === originalToken.tokenId)
// 					?.grammaticalInfo || originalToken.grammaticalInfo,
// 		}));
// 	}

// 	private async processNounTokens(nouns: IWord[]): Promise<IWord[]> {
// 		if (!nouns.length) return [];

// 		const simplifiedNouns = nouns.map(token => ({
// 			tokenId: token.tokenId,
// 			originalText: token.originalText,
// 			grammaticalInfo: token.grammaticalInfo,
// 		}));

// 		const enrichedNouns = await batchProcessor({
// 			items: simplifiedNouns,
// 			processingFn: enrichNounTokens,
// 			batchSize: SpecializedEnricherStep.RATE_LIMITS.BATCH_SIZE,
// 			options: {
// 				retryAttempts: SpecializedEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
// 				delayBetweenBatches:
// 					SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
// 				maxRequestsPerMinute:
// 					SpecializedEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
// 			},
// 		});

// 		return nouns.map(originalToken => ({
// 			...originalToken,
// 			grammaticalInfo:
// 				enrichedNouns.find(t => t.tokenId === originalToken.tokenId)
// 					?.grammaticalInfo || originalToken.grammaticalInfo,
// 		}));
// 	}

// 	private async processAdjectiveTokens(adjectives: IWord[]): Promise<IWord[]> {
// 		if (!adjectives.length) return [];

// 		const simplifiedAdjectives = adjectives.map(token => ({
// 			tokenId: token.tokenId,
// 			originalText: token.originalText,
// 			grammaticalInfo: token.grammaticalInfo,
// 		}));

// 		const enrichedAdjectives = await batchProcessor({
// 			items: simplifiedAdjectives,
// 			processingFn: enrichAdjectiveTokens,
// 			batchSize: SpecializedEnricherStep.RATE_LIMITS.BATCH_SIZE,
// 			options: {
// 				retryAttempts: SpecializedEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
// 				delayBetweenBatches:
// 					SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
// 				maxRequestsPerMinute:
// 					SpecializedEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
// 			},
// 		});

// 		return adjectives.map(originalToken => ({
// 			...originalToken,
// 			grammaticalInfo:
// 				enrichedAdjectives.find(t => t.tokenId === originalToken.tokenId)
// 					?.grammaticalInfo || originalToken.grammaticalInfo,
// 		}));
// 	}

// 	private async processAdverbTokens(adverbs: IWord[]): Promise<IWord[]> {
// 		if (!adverbs.length) return [];

// 		const simplifiedAdverbs = adverbs.map(token => ({
// 			tokenId: token.tokenId,
// 			originalText: token.originalText,
// 			grammaticalInfo: token.grammaticalInfo,
// 		}));

// 		const enrichedAdverbs = await batchProcessor({
// 			items: simplifiedAdverbs,
// 			processingFn: enrichAdverbTokens,
// 			batchSize: SpecializedEnricherStep.RATE_LIMITS.BATCH_SIZE,
// 			options: {
// 				retryAttempts: SpecializedEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
// 				delayBetweenBatches:
// 					SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
// 				maxRequestsPerMinute:
// 					SpecializedEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
// 			},
// 		});

// 		return adverbs.map(originalToken => ({
// 			...originalToken,
// 			grammaticalInfo:
// 				enrichedAdverbs.find(t => t.tokenId === originalToken.tokenId)
// 					?.grammaticalInfo || originalToken.grammaticalInfo,
// 		}));
// 	}

// 	private async processArticleTokens(articles: IWord[]): Promise<IWord[]> {
// 		if (!articles.length) return [];

// 		const simplifiedArticles = articles.map(token => ({
// 			tokenId: token.tokenId,
// 			originalText: token.originalText,
// 			grammaticalInfo: token.grammaticalInfo,
// 		}));

// 		const enrichedArticles = await batchProcessor({
// 			items: simplifiedArticles,
// 			processingFn: enrichArticleTokens,
// 			batchSize: SpecializedEnricherStep.RATE_LIMITS.BATCH_SIZE,
// 			options: {
// 				retryAttempts: SpecializedEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
// 				delayBetweenBatches:
// 					SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
// 				maxRequestsPerMinute:
// 					SpecializedEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
// 			},
// 		});

// 		return articles.map(originalToken => ({
// 			...originalToken,
// 			grammaticalInfo:
// 				enrichedArticles.find(t => t.tokenId === originalToken.tokenId)
// 					?.grammaticalInfo || originalToken.grammaticalInfo,
// 		}));
// 	}

// 	private async processConjunctionTokens(
// 		conjunctions: IWord[],
// 	): Promise<IWord[]> {
// 		if (!conjunctions.length) return [];

// 		const simplifiedConjunctions = conjunctions.map(token => ({
// 			tokenId: token.tokenId,
// 			originalText: token.originalText,
// 			grammaticalInfo: token.grammaticalInfo,
// 		}));

// 		const enrichedConjunctions = await batchProcessor({
// 			items: simplifiedConjunctions,
// 			processingFn: enrichConjunctionTokens,
// 			batchSize: SpecializedEnricherStep.RATE_LIMITS.BATCH_SIZE,
// 			options: {
// 				retryAttempts: SpecializedEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
// 				delayBetweenBatches:
// 					SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
// 				maxRequestsPerMinute:
// 					SpecializedEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
// 			},
// 		});

// 		return conjunctions.map(originalToken => ({
// 			...originalToken,
// 			grammaticalInfo:
// 				enrichedConjunctions.find(t => t.tokenId === originalToken.tokenId)
// 					?.grammaticalInfo || originalToken.grammaticalInfo,
// 		}));
// 	}

// 	private async processDeterminerTokens(
// 		determiners: IWord[],
// 	): Promise<IWord[]> {
// 		if (!determiners.length) return [];

// 		const simplifiedDeterminers = determiners.map(token => ({
// 			tokenId: token.tokenId,
// 			originalText: token.originalText,
// 			grammaticalInfo: token.grammaticalInfo,
// 		}));

// 		const enrichedDeterminers = await batchProcessor({
// 			items: simplifiedDeterminers,
// 			processingFn: enrichDeterminerTokens,
// 			batchSize: SpecializedEnricherStep.RATE_LIMITS.BATCH_SIZE,
// 			options: {
// 				retryAttempts: SpecializedEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
// 				delayBetweenBatches:
// 					SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
// 				maxRequestsPerMinute:
// 					SpecializedEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
// 			},
// 		});

// 		return determiners.map(originalToken => ({
// 			...originalToken,
// 			grammaticalInfo:
// 				enrichedDeterminers.find(t => t.tokenId === originalToken.tokenId)
// 					?.grammaticalInfo || originalToken.grammaticalInfo,
// 		}));
// 	}

// 	private async processInterjectionTokens(
// 		interjections: IWord[],
// 	): Promise<IWord[]> {
// 		if (!interjections.length) return [];

// 		const simplifiedInterjections = interjections.map(token => ({
// 			tokenId: token.tokenId,
// 			originalText: token.originalText,
// 			grammaticalInfo: token.grammaticalInfo,
// 		}));

// 		const enrichedInterjections = await batchProcessor({
// 			items: simplifiedInterjections,
// 			processingFn: enrichInterjectionTokens,
// 			batchSize: SpecializedEnricherStep.RATE_LIMITS.BATCH_SIZE,
// 			options: {
// 				retryAttempts: SpecializedEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
// 				delayBetweenBatches:
// 					SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
// 				maxRequestsPerMinute:
// 					SpecializedEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
// 			},
// 		});

// 		return interjections.map(originalToken => ({
// 			...originalToken,
// 			grammaticalInfo:
// 				enrichedInterjections.find(t => t.tokenId === originalToken.tokenId)
// 					?.grammaticalInfo || originalToken.grammaticalInfo,
// 		}));
// 	}

// 	private async processNumeralTokens(numerals: IWord[]): Promise<IWord[]> {
// 		if (!numerals.length) return [];

// 		const simplifiedNumerals = numerals.map(token => ({
// 			tokenId: token.tokenId,
// 			originalText: token.originalText,
// 			grammaticalInfo: token.grammaticalInfo,
// 		}));

// 		const enrichedNumerals = await batchProcessor({
// 			items: simplifiedNumerals,
// 			processingFn: enrichNumeralTokens,
// 			batchSize: SpecializedEnricherStep.RATE_LIMITS.BATCH_SIZE,
// 			options: {
// 				retryAttempts: SpecializedEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
// 				delayBetweenBatches:
// 					SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
// 				maxRequestsPerMinute:
// 					SpecializedEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
// 			},
// 		});

// 		return numerals.map(originalToken => ({
// 			...originalToken,
// 			grammaticalInfo:
// 				enrichedNumerals.find(t => t.tokenId === originalToken.tokenId)
// 					?.grammaticalInfo || originalToken.grammaticalInfo,
// 		}));
// 	}

// 	private async processPrepositionTokens(
// 		prepositions: IWord[],
// 	): Promise<IWord[]> {
// 		if (!prepositions.length) return [];

// 		const simplifiedPrepositions = prepositions.map(token => ({
// 			tokenId: token.tokenId,
// 			originalText: token.originalText,
// 			grammaticalInfo: token.grammaticalInfo,
// 		}));

// 		const enrichedPrepositions = await batchProcessor({
// 			items: simplifiedPrepositions,
// 			processingFn: enrichPrepositionTokens,
// 			batchSize: SpecializedEnricherStep.RATE_LIMITS.BATCH_SIZE,
// 			options: {
// 				retryAttempts: SpecializedEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
// 				delayBetweenBatches:
// 					SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
// 				maxRequestsPerMinute:
// 					SpecializedEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
// 			},
// 		});

// 		return prepositions.map(originalToken => ({
// 			...originalToken,
// 			grammaticalInfo:
// 				enrichedPrepositions.find(t => t.tokenId === originalToken.tokenId)
// 					?.grammaticalInfo || originalToken.grammaticalInfo,
// 		}));
// 	}

// 	private async processPronounTokens(pronouns: IWord[]): Promise<IWord[]> {
// 		if (!pronouns.length) return [];

// 		const simplifiedPronouns = pronouns.map(token => ({
// 			tokenId: token.tokenId,
// 			originalText: token.originalText,
// 			grammaticalInfo: token.grammaticalInfo,
// 		}));

// 		const enrichedPronouns = await batchProcessor({
// 			items: simplifiedPronouns,
// 			processingFn: enrichPronounTokens,
// 			batchSize: SpecializedEnricherStep.RATE_LIMITS.BATCH_SIZE,
// 			options: {
// 				retryAttempts: SpecializedEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
// 				delayBetweenBatches:
// 					SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
// 				maxRequestsPerMinute:
// 					SpecializedEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
// 			},
// 		});

// 		return pronouns.map(originalToken => ({
// 			...originalToken,
// 			grammaticalInfo:
// 				enrichedPronouns.find(t => t.tokenId === originalToken.tokenId)
// 					?.grammaticalInfo || originalToken.grammaticalInfo,
// 		}));
// 	}
// }
