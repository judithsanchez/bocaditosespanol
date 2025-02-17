import {PipelineStep} from '../Pipeline';
import {Logger} from '../../utils/index';
import {GenericAIEnricher} from '../../utils/GenericAIEnricher';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {ContentSchemaFactory} from '../../factories/ContentSchemaFactory';
import {ContentInstructionFactory} from '../../factories/ContentInstructionsFactory';
import {ContentType, ISentence} from '@bocaditosespanol/shared';
import {BatchProcessor} from '../../utils/BatchProcessor';
import {AIProviderFactory} from '../../factories/index';
import {AIStepType} from '../../config/AIConfig';

export class SentenceAIEnricherSteps
	implements PipelineStep<SongProcessingContext>
{
	private readonly logger = new Logger('SentenceAIEnricherSteps');
	private readonly enricher: GenericAIEnricher;
	private readonly batchProcessor: BatchProcessor<ISentence>;

	constructor() {
		const provider = AIProviderFactory.getInstance().getProvider(
			AIStepType.SENTENCE_ENRICHER,
		);
		this.enricher = new GenericAIEnricher(provider);
		this.batchProcessor = new BatchProcessor();
	}
	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');

		const schema = ContentSchemaFactory.createSchema(ContentType.SONG);
		const instruction = ContentInstructionFactory.createInstruction(
			ContentType.SONG,
		);

		const enrichedSentences = await this.batchProcessor.process({
			items: context.sentences.deduplicated,
			processingFn: async sentences => {
				return this.enricher.enrich({
					input: sentences,
					schema,
					instruction,
				});
			},
			batchSize: 5,
			options: {
				retryAttempts: 3,
				delayBetweenBatches: 6000,
				maxRequestsPerMinute: 1,
				timeoutMs: 30000,
			},
			onProgress: progress => {
				this.logger.info('Sentence enrichment progress', {
					processed: progress.processedItems,
					total: progress.totalItems,
					currentBatch: progress.currentBatch,
					failedBatches: progress.failedBatches,
					estimatedTimeRemaining: progress.estimatedTimeRemaining,
				});
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
