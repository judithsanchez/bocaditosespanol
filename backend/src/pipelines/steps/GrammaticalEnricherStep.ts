import {PipelineStep} from '../Pipeline';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {AIProvider} from '../../lib/types';
import {
	TokenType,
	IWord,
	PartOfSpeech,
	IPunctuationSign,
	IEmoji,
	ISense,
} from '@bocaditosespanol/shared';
import {batchProcessor, Logger} from '../../utils/index';
import {GenericAIEnricher} from '../../utils';
import {
	PartOfSpeechSchemaFactory,
	SystemInstructionFactory,
} from '../../factories';

export class GrammaticalEnricherStep
	implements PipelineStep<SongProcessingContext>
{
	private static readonly RATE_LIMITS = {
		BATCH_SIZE: 10,
		RETRY_ATTEMPTS: 3,
		DELAY_BETWEEN_BATCHES: 6000,
		REQUESTS_PER_MINUTE: 1,
	};

	private readonly logger = new Logger('GrammaticalEnricherStep');
	private readonly enricher: GenericAIEnricher;
	private lastProcessingTime: number = 0;

	constructor(aiProvider: AIProvider) {
		this.enricher = new GenericAIEnricher(aiProvider);
	}

	private async enforceRateLimit() {
		const now = Date.now();
		const timeSinceLastProcess = now - this.lastProcessingTime;

		if (
			timeSinceLastProcess <
			GrammaticalEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES
		) {
			const waitTime =
				GrammaticalEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES -
				timeSinceLastProcess;
			await new Promise(resolve => setTimeout(resolve, waitTime));
		}
		this.lastProcessingTime = Date.now();
	}

	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');

		this.logger.info('Starting grammatical enrichment', {
			tokensToProcess: context.tokens.enriched.length,
			firstToken: context.tokens.enriched[0]?.content,
			lastToken:
				context.tokens.enriched[context.tokens.enriched.length - 1]?.content,
		});

		const enrichedTokens = context.tokens.enriched;

		console.log(enrichedTokens);

		const enrichmentQueue = [
			{
				type: PartOfSpeech.Verb,
				tokens: this.filterSensesByType(enrichedTokens, PartOfSpeech.Verb),
				getSchema: PartOfSpeechSchemaFactory.createVerbSchema,
				getInstruction: SystemInstructionFactory.createVerbInstruction,
			},
			{
				type: PartOfSpeech.Noun,
				tokens: this.filterSensesByType(enrichedTokens, PartOfSpeech.Noun),
				getSchema: PartOfSpeechSchemaFactory.createNounSchema,
				getInstruction: SystemInstructionFactory.createNounInstruction,
			},
			{
				type: PartOfSpeech.Adjective,
				tokens: this.filterSensesByType(enrichedTokens, PartOfSpeech.Adjective),
				getSchema: PartOfSpeechSchemaFactory.createAdjectiveSchema,
				getInstruction: SystemInstructionFactory.createAdjectiveInstruction,
			},
			{
				type: PartOfSpeech.Adverb,
				tokens: this.filterSensesByType(enrichedTokens, PartOfSpeech.Adverb),
				getSchema: PartOfSpeechSchemaFactory.createAdverbSchema,
				getInstruction: SystemInstructionFactory.createAdverbInstruction,
			},
			{
				type: PartOfSpeech.Article,
				tokens: this.filterSensesByType(enrichedTokens, PartOfSpeech.Article),
				getSchema: PartOfSpeechSchemaFactory.createArticleSchema,
				getInstruction: SystemInstructionFactory.createArticleInstruction,
			},
			{
				type: PartOfSpeech.Conjunction,
				tokens: this.filterSensesByType(
					enrichedTokens,
					PartOfSpeech.Conjunction,
				),
				getSchema: PartOfSpeechSchemaFactory.createConjunctionSchema,
				getInstruction: SystemInstructionFactory.createConjunctionInstruction,
			},
			{
				type: PartOfSpeech.Determiner,
				tokens: this.filterSensesByType(
					enrichedTokens,
					PartOfSpeech.Determiner,
				),
				getSchema: PartOfSpeechSchemaFactory.createDeterminerSchema,
				getInstruction: SystemInstructionFactory.createDeterminerInstruction,
			},
			{
				type: PartOfSpeech.Interjection,
				tokens: this.filterSensesByType(
					enrichedTokens,
					PartOfSpeech.Interjection,
				),
				getSchema: PartOfSpeechSchemaFactory.createInterjectionSchema,
				getInstruction: SystemInstructionFactory.createInterjectionInstruction,
			},
			{
				type: PartOfSpeech.Numeral,
				tokens: this.filterSensesByType(enrichedTokens, PartOfSpeech.Numeral),
				getSchema: PartOfSpeechSchemaFactory.createNumeralSchema,
				getInstruction: SystemInstructionFactory.createNumeralInstruction,
			},
			{
				type: PartOfSpeech.Preposition,
				tokens: this.filterSensesByType(
					enrichedTokens,
					PartOfSpeech.Preposition,
				),
				getSchema: PartOfSpeechSchemaFactory.createPrepositionSchema,
				getInstruction: SystemInstructionFactory.createPrepositionInstruction,
			},
			{
				type: PartOfSpeech.Pronoun,
				tokens: this.filterSensesByType(enrichedTokens, PartOfSpeech.Pronoun),
				getSchema: PartOfSpeechSchemaFactory.createPronounSchema,
				getInstruction: SystemInstructionFactory.createPronounInstruction,
			},
		];

		interface EnrichmentResult {
			type: PartOfSpeech;
			enriched: IWord[];
		}

		const results: EnrichmentResult[] = [];
		console.log('enrichmentQueue:', results);

		for (const {type, tokens, getSchema, getInstruction} of enrichmentQueue) {
			if (tokens.length === 0) {
				results.push({type, enriched: []});
				continue;
			}

			await this.enforceRateLimit();

			const simplifiedTokens = tokens.flatMap(
				token =>
					token.senses
						?.filter(sense => sense.partOfSpeech === type)
						.map(sense => ({
							tokenId: token.tokenId,
							senseId: sense.senseId,
							content: token.content,
							grammaticalInfo: sense.grammaticalInfo,
						})) ?? [],
			);

			const enriched = await batchProcessor({
				items: simplifiedTokens,
				processingFn: async batchTokens => {
					const schema = getSchema();
					const instruction = getInstruction();

					return this.enricher.enrich({
						input: batchTokens,
						schema,
						instruction,
					});
				},
				batchSize: GrammaticalEnricherStep.RATE_LIMITS.BATCH_SIZE,
				options: {
					retryAttempts: GrammaticalEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
					delayBetweenBatches:
						GrammaticalEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
					maxRequestsPerMinute:
						GrammaticalEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
				},
			});

			const processedTokens = tokens.map(originalToken => ({
				...originalToken,
				lastUpdated: Date.now(),
				senses: originalToken.senses?.map(sense => {
					const enrichedSense = enriched.find(
						e =>
							e.tokenId === originalToken.tokenId &&
							e.senseId === sense.senseId,
					);

					return enrichedSense
						? {
								...sense,
								lastUpdated: Date.now(),
								grammaticalInfo: enrichedSense.grammaticalInfo,
							}
						: sense;
				}),
			}));
			results.push({type, enriched: processedTokens});
		}

		const processedTokens = results.reduce<IWord[]>(
			(acc: IWord[], {enriched}: EnrichmentResult) => [...acc, ...enriched],
			[],
		);

		const remainingWords = enrichedTokens
			.filter((token): token is IWord => token.tokenType === TokenType.Word)
			.filter(
				wordToken =>
					!wordToken.senses?.some(sense =>
						enrichmentQueue
							.map(q => q.type)
							.includes(sense.partOfSpeech as PartOfSpeech),
					),
			);

		this.logger.info('Processed tokens:', {
			count: processedTokens.length,
			tokens: processedTokens.map(t => ({
				tokenId: t.tokenId,
				content: t.content,
				senses: t.senses?.map(s => s.partOfSpeech),
			})),
		});

		this.logger.info('Remaining words:', {
			count: remainingWords.length,
			tokens: remainingWords.map(t => ({
				tokenId: t.tokenId,
				content: t.content,
				senses: t.senses?.map(s => s.partOfSpeech),
			})),
		});

		context.tokens.enriched = [...processedTokens, ...remainingWords];

		this.logger.info('Final merged tokens:', {
			totalTokens: context.tokens.enriched.length,
			tokens: context.tokens.enriched.map(t => ({
				tokenId: t.tokenId,
				content: t.content,
				senses: (t as IWord).senses?.map((s: ISense) => s.partOfSpeech),
			})),
		});

		this.logger.info('Grammatical enrichment completed', {
			totalProcessedTokens: context.tokens.enriched.length,
			byPartOfSpeech: {
				verbs: this.filterSensesByType(
					context.tokens.enriched,
					PartOfSpeech.Verb,
				).length,
				nouns: this.filterSensesByType(
					context.tokens.enriched,
					PartOfSpeech.Noun,
				).length,
				adjectives: this.filterSensesByType(
					context.tokens.enriched,
					PartOfSpeech.Adjective,
				).length,
				adverbs: this.filterSensesByType(
					context.tokens.enriched,
					PartOfSpeech.Adverb,
				).length,
				articles: this.filterSensesByType(
					context.tokens.enriched,
					PartOfSpeech.Article,
				).length,
				conjunctions: this.filterSensesByType(
					context.tokens.enriched,
					PartOfSpeech.Conjunction,
				).length,
				determiners: this.filterSensesByType(
					context.tokens.enriched,
					PartOfSpeech.Determiner,
				).length,
				interjections: this.filterSensesByType(
					context.tokens.enriched,
					PartOfSpeech.Interjection,
				).length,
				numerals: this.filterSensesByType(
					context.tokens.enriched,
					PartOfSpeech.Numeral,
				).length,
				prepositions: this.filterSensesByType(
					context.tokens.enriched,
					PartOfSpeech.Preposition,
				).length,
				pronouns: this.filterSensesByType(
					context.tokens.enriched,
					PartOfSpeech.Pronoun,
				).length,
			},
		});

		this.logger.end('process');
		return context;
	}
	private filterSensesByType(
		tokens: Array<IWord | IPunctuationSign | IEmoji>,
		partOfSpeech: PartOfSpeech,
	): IWord[] {
		return tokens.filter((token): token is IWord => {
			if (token.tokenType !== TokenType.Word) return false;
			if (!token.senses) return false;
			return token.senses.some(sense => sense.partOfSpeech === partOfSpeech);
		});
	}
}
