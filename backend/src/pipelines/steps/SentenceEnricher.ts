import {PipelineStep} from '../Pipeline';
import {Logger} from '../../utils/index';
import {GenericAIEnricher} from '../../utils/GenericAIEnricher';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {batchProcessor} from '../../utils/batchProcessor';
import {ContentSchemaFactory} from '../../factories/ContentSchemaFactory';
import {ContentInstructionFactory} from '../../factories/ContentInstructionsFactory';
import {AIProvider} from 'lib/types';
import {ContentType} from '@bocaditosespanol/shared';

export class SentenceEnricherSteps
	implements PipelineStep<SongProcessingContext>
{
	private static readonly RATE_LIMITS = {
		BATCH_SIZE: 5,
		RETRY_ATTEMPTS: 3,
		DELAY_BETWEEN_BATCHES: 6000,
		REQUESTS_PER_MINUTE: 1,
	};

	private readonly logger = new Logger('SentenceEnricherStep');
	private readonly enricher: GenericAIEnricher;

	constructor(aiProvider: AIProvider) {
		this.enricher = new GenericAIEnricher(aiProvider);
	}

	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');

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
			batchSize: SentenceEnricherSteps.RATE_LIMITS.BATCH_SIZE,
			options: {
				retryAttempts: SentenceEnricherSteps.RATE_LIMITS.RETRY_ATTEMPTS,
				delayBetweenBatches:
					SentenceEnricherSteps.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
				maxRequestsPerMinute:
					SentenceEnricherSteps.RATE_LIMITS.REQUESTS_PER_MINUTE,
			},
		});

		context.sentences.enriched = enrichedSentences;

		this.logger.info('Sentence enrichment completed', {
			totalSentences: context.sentences.enriched.length,
		});

		this.logger.end('process');
		return context;
	}
}
