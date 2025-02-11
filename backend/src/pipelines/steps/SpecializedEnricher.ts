import {PipelineStep} from '../Pipeline';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {AIProvider} from '../../lib/types';
import {
	TokenType,
	IWord,
	PartOfSpeech,
	IPunctuationSign,
	IEmoji,
} from '@bocaditosespanol/shared';
import {batchProcessor, Logger} from '../../utils/index';
import {GenericAIEnricher} from '../../utils';
import {
	PartOfSpeechSchemaFactory,
	SystemInstructionFactory,
} from '../../factories';

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
				getSchema: PartOfSpeechSchemaFactory.createVerbSchema,
				getInstruction: SystemInstructionFactory.createVerbInstruction,
			},
			{
				type: PartOfSpeech.Noun,
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Noun),
				getSchema: PartOfSpeechSchemaFactory.createNounSchema,
				getInstruction: SystemInstructionFactory.createNounInstruction,
			},
			{
				type: PartOfSpeech.Adjective,
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Adjective),
				getSchema: PartOfSpeechSchemaFactory.createAdjectiveSchema,
				getInstruction: SystemInstructionFactory.createAdjectiveInstruction,
			},
			{
				type: PartOfSpeech.Adverb,
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Adverb),
				getSchema: PartOfSpeechSchemaFactory.createAdverbSchema,
				getInstruction: SystemInstructionFactory.createAdverbInstruction,
			},
			{
				type: PartOfSpeech.Article,
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Article),
				getSchema: PartOfSpeechSchemaFactory.createArticleSchema,
				getInstruction: SystemInstructionFactory.createArticleInstruction,
			},
			{
				type: PartOfSpeech.Conjunction,
				tokens: this.filterTokensByType(
					enrichedTokens,
					PartOfSpeech.Conjunction,
				),
				getSchema: PartOfSpeechSchemaFactory.createConjunctionSchema,
				getInstruction: SystemInstructionFactory.createConjunctionInstruction,
			},
			{
				type: PartOfSpeech.Determiner,
				tokens: this.filterTokensByType(
					enrichedTokens,
					PartOfSpeech.Determiner,
				),
				getSchema: PartOfSpeechSchemaFactory.createDeterminerSchema,
				getInstruction: SystemInstructionFactory.createDeterminerInstruction,
			},
			{
				type: PartOfSpeech.Interjection,
				tokens: this.filterTokensByType(
					enrichedTokens,
					PartOfSpeech.Interjection,
				),
				getSchema: PartOfSpeechSchemaFactory.createInterjectionSchema,
				getInstruction: SystemInstructionFactory.createInterjectionInstruction,
			},
			{
				type: PartOfSpeech.Numeral,
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Numeral),
				getSchema: PartOfSpeechSchemaFactory.createNumeralSchema,
				getInstruction: SystemInstructionFactory.createNumeralInstruction,
			},
			{
				type: PartOfSpeech.Preposition,
				tokens: this.filterTokensByType(
					enrichedTokens,
					PartOfSpeech.Preposition,
				),
				getSchema: PartOfSpeechSchemaFactory.createPrepositionSchema,
				getInstruction: SystemInstructionFactory.createPrepositionInstruction,
			},
			{
				type: PartOfSpeech.Pronoun,
				tokens: this.filterTokensByType(enrichedTokens, PartOfSpeech.Pronoun),
				getSchema: PartOfSpeechSchemaFactory.createPronounSchema,
				getInstruction: SystemInstructionFactory.createPronounInstruction,
			},
		];

		const results = [];

		for (const {type, tokens, getSchema, getInstruction} of enrichmentQueue) {
			if (tokens.length === 0) {
				results.push({type, enriched: []});
				continue;
			}

			await this.enforceRateLimit();

			const simplifiedTokens = tokens.map(token => ({
				tokenId: token.tokenId,
				content: token.content,
				grammaticalInfo: token.grammaticalInfo,
			}));

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

		const remainingWords = enrichedTokens
			.filter((token): token is IWord => token.tokenType === TokenType.Word)
			.filter(
				wordToken =>
					!enrichmentQueue
						.map(q => q.type)
						.includes(wordToken.partOfSpeech as PartOfSpeech),
			);

		context.tokens.enriched = [...processedTokens, ...remainingWords];

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

	private filterTokensByType(
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
