import {PipelineStep} from '../Pipeline';
import {Logger} from '../../utils/index';
import {GenericAIEnricher} from '../../utils/GenericAIEnricher';
import {SongProcessingContext} from '../ContentProcessingPipeline';
import {ContentSchemaFactory} from '../../factories/ContentSchemaFactory';
import {ContentInstructionFactory} from '../../factories/ContentInstructionsFactory';
import {ContentType, ISentence} from '@/lib/types/grammar';
import {BatchProcessor} from '../../utils/BatchProcessor';
import {AIProviderFactory} from '../../factories/index';
import {
	ACTIVE_PROVIDER,
	AIStepType,
	PROVIDER_BATCH_CONFIGS,
} from '../../config/AIConfig';

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
		const batchConfig = PROVIDER_BATCH_CONFIGS[ACTIVE_PROVIDER.type];
		this.batchProcessor = new BatchProcessor(batchConfig);
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
			processingFn: async (sentences: ISentence[]): Promise<ISentence[]> => {
				return this.enricher.enrich({
					input: sentences,
					schema,
					instruction,
				}) as Promise<ISentence[]>;
			},
			batchSize: 5,
			options: PROVIDER_BATCH_CONFIGS[ACTIVE_PROVIDER.type],
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
