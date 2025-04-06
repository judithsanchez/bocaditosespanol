import {PipelineStep} from '../Pipeline';
import {Logger} from '../../utils/index';
import {GenericAIEnricher} from '../../utils/GenericAIEnricher';
import {SongProcessingContext} from '../ContentProcessingPipeline';
import {ContentType, ILearningInsight, ISentence} from '@/lib/types/grammar';
import {BatchProcessor} from '../../utils/BatchProcessor';
import {AIProviderFactory} from '../../factories/index';
import {
	ACTIVE_PROVIDER,
	AIStepType,
	PROVIDER_BATCH_CONFIGS,
} from '../../config/AIConfig';
import {SentencesSchemaFactory} from '../../factories/SentencesSchemaFactory';
import {SentencesInstructionsFactory} from '../../factories/SentencesInstructionsFactory';

export class SentenceLearningInsightsEnricherStep
	implements PipelineStep<SongProcessingContext>
{
	private readonly logger = new Logger('SentenceLearningInsightsEnricherStep');
	private readonly enricher: GenericAIEnricher;
	private readonly batchProcessor: BatchProcessor<ISentence>;

	constructor() {
		const provider = AIProviderFactory.getInstance().getProvider(
			AIStepType.LEARNING_INSIGHTS_ENRICHER,
		);

		// TODO: refactor so enricher and batch config depend on the active provider making it the single source of truth
		this.enricher = new GenericAIEnricher(provider);
		const batchConfig = PROVIDER_BATCH_CONFIGS[ACTIVE_PROVIDER.type];
		this.batchProcessor = new BatchProcessor(batchConfig);
	}

	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');

		const simplifiedSentences: ISentence[] = context.sentences.enriched.map(
			sentence => ({
				sentenceId: sentence.sentenceId,
				content: sentence.content,
				translations: sentence.translations,
				tokenIds: sentence.tokenIds,
			}),
		);

		const schema = SentencesSchemaFactory.createSchema(ContentType.SONG);
		const instruction = SentencesInstructionsFactory.createInstruction(
			ContentType.SONG,
		);

		const enrichedSentences = await this.batchProcessor.process({
			items: simplifiedSentences,
			processingFn: async (sentences: ISentence[]): Promise<ISentence[]> => {
				const result = await this.enricher.enrich({
					input: sentences,
					schema,
					instruction,
				});
				return result as ISentence[];
			},
			batchSize: 5,
			options: PROVIDER_BATCH_CONFIGS[ACTIVE_PROVIDER.type],
			onProgress: progress => {
				this.logger.info('Learning insights enrichment progress', {
					processed: progress.processedItems,
					total: progress.totalItems,
					currentBatch: progress.currentBatch,
					failedBatches: progress.failedBatches,
					estimatedTimeRemaining: progress.estimatedTimeRemaining,
				});
			},
		});
		this.logger.info('Enriched sentences:', {enrichedSentences});

		context.sentences.enriched = context.sentences.enriched.map(sentence => {
			const enrichedSentence = enrichedSentences.find(
				es => es.sentenceId === sentence.sentenceId,
			);
			return {
				...sentence,
				learningInsights: {
					insight: enrichedSentence?.learningInsights?.insight,
					difficulty: enrichedSentence?.learningInsights?.difficulty,
				} as ILearningInsight,
			};
		});

		this.logger.info('Learning insights enrichment completed', {
			processedSentences: context.sentences.enriched.length,
		});

		this.logger.end('process');
		return context;
	}
}
