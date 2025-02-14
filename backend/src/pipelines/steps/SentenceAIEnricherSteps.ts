import {PipelineStep} from '../Pipeline';
import {Logger} from '../../utils/index';
import {GenericAIEnricher} from '../../utils/GenericAIEnricher';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {batchProcessor} from '../../utils/batchProcessor';
import {ContentSchemaFactory} from '../../factories/ContentSchemaFactory';
import {ContentInstructionFactory} from '../../factories/ContentInstructionsFactory';
import {AIProvider} from 'lib/types';
import {ContentType} from '@bocaditosespanol/shared';

export class SentenceAIEnricherSteps
	implements PipelineStep<SongProcessingContext>
{
	private static readonly RATE_LIMITS = {
		BATCH_SIZE: 5,
		RETRY_ATTEMPTS: 3,
		DELAY_BETWEEN_BATCHES: 6000,
		REQUESTS_PER_MINUTE: 1,
	};

	private readonly logger = new Logger('SentenceAIEnricherSteps');
	private readonly enricher: GenericAIEnricher;

	constructor(aiProvider: AIProvider) {
		this.enricher = new GenericAIEnricher(aiProvider);
	}

	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');

		this.logger.info('Starting AI enrichment', {
			sentencesToProcess: context.sentences.deduplicated.length,
			batchSize: SentenceAIEnricherSteps.RATE_LIMITS.BATCH_SIZE,
		});

		const schema = ContentSchemaFactory.createSchema(ContentType.SONG);
		const instruction = ContentInstructionFactory.createInstruction(
			ContentType.SONG,
		);

		const enrichedSentences = await batchProcessor({
			items: context.sentences.deduplicated,
			processingFn: async sentences => {
				const enriched = await this.enricher.enrich({
					input: sentences,
					schema,
					instruction,
				});

				return enriched;
			},
			batchSize: SentenceAIEnricherSteps.RATE_LIMITS.BATCH_SIZE,
			options: {
				retryAttempts: SentenceAIEnricherSteps.RATE_LIMITS.RETRY_ATTEMPTS,
				delayBetweenBatches:
					SentenceAIEnricherSteps.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
				maxRequestsPerMinute:
					SentenceAIEnricherSteps.RATE_LIMITS.REQUESTS_PER_MINUTE,
			},
		});

		context.sentences.enriched = enrichedSentences;

		this.logger.info('AI enrichment completed', {
			processedSentences: context.sentences.enriched.length,
			firstEnriched: context.sentences.enriched[0],
			lastEnriched:
				context.sentences.enriched[context.sentences.enriched.length - 1],
		});

		this.logger.end('process');
		return context;
	}
}
