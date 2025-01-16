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
	private lastProcessingTime: number = 0;

	private async enforceRateLimit() {
		const now = Date.now();
		const timeSinceLastProcess = now - this.lastProcessingTime;

		if (
			timeSinceLastProcess <
			SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES
		) {
			const waitTime =
				SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES -
				timeSinceLastProcess;
			await new Promise(resolve => setTimeout(resolve, waitTime));
		}
		this.lastProcessingTime = Date.now();
	}

	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');
		const enrichedTokens = context.tokens.enriched;

		const enrichmentQueue = [
			{
				type: PartOfSpeech.Verb,
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Verb),
				fn: enrichVerbTokens,
			},
			{
				type: PartOfSpeech.Noun,
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Noun),
				fn: enrichNounTokens,
			},
			{
				type: PartOfSpeech.Adjective,
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Adjective),
				fn: enrichAdjectiveTokens,
			},
			{
				type: PartOfSpeech.Adverb,
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Adverb),
				fn: enrichAdverbTokens,
			},
			{
				type: PartOfSpeech.Article,
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Article),
				fn: enrichArticleTokens,
			},
			{
				type: PartOfSpeech.Conjunction,
				tokens: this.filterTokensByType(
					enrichedTokens,
					PartOfSpeech.Conjunction,
				),
				fn: enrichConjunctionTokens,
			},
			{
				type: PartOfSpeech.Determiner,
				tokens: this.filterTokensByType(
					enrichedTokens,
					PartOfSpeech.Determiner,
				),
				fn: enrichDeterminerTokens,
			},
			{
				type: PartOfSpeech.Interjection,
				tokens: this.filterTokensByType(
					enrichedTokens,
					PartOfSpeech.Interjection,
				),
				fn: enrichInterjectionTokens,
			},
			{
				type: PartOfSpeech.Numeral,
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Numeral),
				fn: enrichNumeralTokens,
			},
			{
				type: PartOfSpeech.Preposition,
				tokens: this.filterTokensByType(
					enrichedTokens,
					PartOfSpeech.Preposition,
				),
				fn: enrichPrepositionTokens,
			},
			{
				type: PartOfSpeech.Pronoun,
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Pronoun),
				fn: enrichPronounTokens,
			},
		];

		const results = [];

		for (const {type, tokens, fn} of enrichmentQueue) {
			if (tokens.length === 0) {
				results.push({type, enriched: []});
				continue;
			}

			await this.enforceRateLimit();

			const simplifiedTokens = tokens.map(token => ({
				tokenId: token.tokenId,
				originalText: token.originalText,
				grammaticalInfo: token.grammaticalInfo,
			}));

			const enriched = await batchProcessor({
				items: simplifiedTokens,
				processingFn: fn,
				batchSize: SpecializedEnricherStep.RATE_LIMITS.BATCH_SIZE,
				options: {
					retryAttempts: SpecializedEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
					delayBetweenBatches:
						SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
					maxRequestsPerMinute:
						SpecializedEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
				},
			});

			const processedTokens = tokens.map(originalToken => ({
				...originalToken,
				grammaticalInfo:
					enriched.find(t => t.tokenId === originalToken.tokenId)
						?.grammaticalInfo || originalToken.grammaticalInfo,
			}));

			results.push({type, enriched: processedTokens});
		}

		const processedTokens = results.reduce(
			(acc, {enriched}) => [...acc, ...enriched],
			[] as IWord[],
		);

		context.tokens.enriched = [
			...processedTokens,
			...enrichedTokens.filter(
				token =>
					token.tokenType !== TokenType.Word ||
					!enrichmentQueue
						.map(q => q.type)
						.includes(token.partOfSpeech as PartOfSpeech),
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
// 				originalText: string;
// 				grammaticalInfo: any;
// 			}>,
// 		) => Promise<any[]>,
// 	): Promise<T[]> {
// 		if (!tokens.length) return [];

// 		const simplifiedTokens = tokens.map(token => ({
// 			tokenId: token.tokenId,
// 			originalText: token.originalText,
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
