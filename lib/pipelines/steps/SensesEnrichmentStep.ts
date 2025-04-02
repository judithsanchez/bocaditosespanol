import {PipelineStep} from '../Pipeline';
import {SongProcessingContext} from '../ContentProcessingPipeline';
import {Logger} from '../../utils/index';
import {BatchProcessor} from '../../utils/BatchProcessor';
import {IWord} from '@/lib/types/common';
import {GenericAIEnricher} from '../../utils/GenericAIEnricher';
import {TokenAIEnrichmentFactory} from '../../factories/TokenAIEnrichmentFactory';
import {TokenAIEnrichmentInstructionFactory} from '../../factories/TokenAIEnrichmentInstructionFactory';
import {AIProviderFactory} from '../../factories/index';
import {
	ACTIVE_PROVIDER,
	AIStepType,
	PROVIDER_BATCH_CONFIGS,
} from '../../config/AIConfig';

export class SensesEnrichmentStep
	implements PipelineStep<SongProcessingContext>
{
	private readonly logger = new Logger('SensesEnrichmentStep');
	private readonly enricher: GenericAIEnricher;

	constructor() {
		const provider = AIProviderFactory.getInstance().getProvider(
			AIStepType.SENSES_ENRICHMENT,
		);
		this.enricher = new GenericAIEnricher(provider);
	}

	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');

		this.logger.info('Starting senses enrichment', {
			tokensToProcess: context.tokens.words.length,
			firstToken: context.tokens.words[0]?.content,
			lastToken: context.tokens.words[context.tokens.words.length - 1]?.content,
		});

		const batchConfig = PROVIDER_BATCH_CONFIGS[ACTIVE_PROVIDER.type];
		const batchProcessor = new BatchProcessor<IWord>(batchConfig);

		const enrichedTokens = await batchProcessor.process({
			items: context.tokens.words,
			processingFn: async (tokens: IWord[]): Promise<IWord[]> => {
				const schema = TokenAIEnrichmentFactory.createSenseSchema();
				const instruction =
					TokenAIEnrichmentInstructionFactory.createSensesInstruction();

				return this.enricher.enrich({
					input: tokens,
					schema,
					instruction,
				}) as Promise<IWord[]>;
			},
			batchSize: 10,
			options: batchConfig,
			onProgress: progress => {
				this.logger.info('Senses enrichment progress', {
					processed: progress.processedItems,
					total: progress.totalItems,
					currentBatch: progress.currentBatch,
					failedBatches: progress.failedBatches,
				});
			},
		});

		context.tokens.enriched = context.tokens.words.map(originalToken => {
			const enrichedToken = enrichedTokens.find(
				t => t.tokenId === originalToken.tokenId,
			);

			if (enrichedToken && 'senses' in enrichedToken && enrichedToken.senses) {
				return {
					...originalToken,
					senses: enrichedToken.senses.map(sense => ({
						...sense,
						senseId: `sense-${sense.partOfSpeech}-${originalToken.content}`,
						lastUpdated: Date.now(),
					})),
					lastUpdated: Date.now(),
				} as IWord;
			}
			return originalToken;
		});

		this.logger.info('Senses enrichment completed', {
			processedTokens: context.tokens.enriched.length,
			firstEnriched: context.tokens.enriched[0]?.content,
			lastEnriched:
				context.tokens.enriched[context.tokens.enriched.length - 1]?.content,
		});

		this.logger.end('process');
		return context;
	}
}
