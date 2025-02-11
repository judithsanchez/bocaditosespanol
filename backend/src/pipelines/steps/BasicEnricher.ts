import {PipelineStep} from '../Pipeline';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {Logger} from '../../utils/index';
import {batchProcessor} from '../../utils/batchProcessor';
import {IWord, TokenType} from '@bocaditosespanol/shared';
import {GenericAIEnricher} from '../../utils/GenericAIEnricher';
import {BaseWordSchemaFactory} from '../../factories/BaseWordSchemaFactory';
import {BaseWordInstructionFactory} from '../../factories/BaseWordSystemInstructionsFactory';
import {AIProvider} from '../../lib/types';

export class BasicEnricherStep implements PipelineStep<SongProcessingContext> {
	private static readonly RATE_LIMITS = {
		BATCH_SIZE: 10,
		RETRY_ATTEMPTS: 3,
		DELAY_BETWEEN_BATCHES: 6000,
		REQUESTS_PER_MINUTE: 1,
	};

	private readonly logger = new Logger('BasicEnricherStep');
	private readonly enricher: GenericAIEnricher;

	constructor(aiProvider: AIProvider) {
		this.enricher = new GenericAIEnricher(aiProvider);
	}

	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');

		const wordTokens = context.tokens.newTokens.filter(
			(token): token is IWord => token.tokenType === TokenType.Word,
		);

		this.logger.info('Starting basic token enrichment', {
			totalTokens: wordTokens.length,
		});

		const enrichedTokens = await batchProcessor({
			items: wordTokens,
			processingFn: async tokens => {
				const schema = BaseWordSchemaFactory.createSchema();
				const instruction = BaseWordInstructionFactory.createInstruction();

				return this.enricher.enrich({
					input: tokens,
					schema,
					instruction,
				});
			},
			batchSize: BasicEnricherStep.RATE_LIMITS.BATCH_SIZE,
			options: {
				retryAttempts: BasicEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
				delayBetweenBatches:
					BasicEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
				maxRequestsPerMinute: BasicEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
			},
		});

		context.tokens.enriched = [
			...enrichedTokens,
			...context.tokens.newTokens.filter(t => t.tokenType !== TokenType.Word),
		];

		this.logger.info('Basic enrichment completed', {
			enrichedTokens: enrichedTokens.length,
			byPartOfSpeech: this.getPartOfSpeechStats(enrichedTokens),
		});

		this.logger.end('process');
		return context;
	}

	private getPartOfSpeechStats(tokens: IWord[]): Record<string, number> {
		return tokens.reduce(
			(acc, token) => {
				const pos = (token.partOfSpeech as string) || 'unknown';
				acc[pos] = (acc[pos] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);
	}
}
