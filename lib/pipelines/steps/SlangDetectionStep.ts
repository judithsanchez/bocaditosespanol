import {PipelineStep} from '../Pipeline';
import {SongProcessingContext} from '../ContentProcessingPipeline';
import {Logger} from '../../utils/index';
import {BatchProcessor} from '../../utils/BatchProcessor';
import {GenericAIEnricher} from '../../utils/GenericAIEnricher';
import {TokenAIEnrichmentFactory} from '../../factories/TokenAIEnrichmentFactory';
import {TokenAIEnrichmentInstructionFactory} from '../../factories/TokenAIEnrichmentInstructionFactory';
import {IWord, TokenType} from '@/lib/types/grammar';
import {AIProviderFactory} from '../../factories/index';
import {
	ACTIVE_PROVIDER,
	AIStepType,
	PROVIDER_BATCH_CONFIGS,
} from '../../config/AIConfig';

export class SlangDetectionStep implements PipelineStep<SongProcessingContext> {
	private readonly logger = new Logger('SlangDetectionStep');
	private readonly enricher: GenericAIEnricher;
	private readonly batchProcessor: BatchProcessor<IWord>;

	constructor() {
		const provider = AIProviderFactory.getInstance().getProvider(
			AIStepType.SLANG_DETECTION,
		);
		this.enricher = new GenericAIEnricher(provider);
		const batchConfig = PROVIDER_BATCH_CONFIGS[ACTIVE_PROVIDER.type];
		this.batchProcessor = new BatchProcessor(batchConfig);
	}

	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');
		this.logger.info('Starting slang detection', {
			tokensToProcess: context.tokens.enriched.length,
			firstToken: context.tokens.enriched[0]?.content,
			lastToken:
				context.tokens.enriched[context.tokens.enriched.length - 1]?.content,
		});

		const enrichedTokens = await this.batchProcessor.process({
			items: context.tokens.enriched.filter(
				(token): token is IWord => token.tokenType === TokenType.Word,
			),
			processingFn: async (tokens: IWord[]): Promise<IWord[]> => {
				const schema = TokenAIEnrichmentFactory.createSlangSchema();
				const instruction =
					TokenAIEnrichmentInstructionFactory.createSlangInstruction();
				return this.enricher.enrich({
					input: tokens,
					schema,
					instruction,
				}) as Promise<IWord[]>;
			},
			batchSize: 10,
			options: PROVIDER_BATCH_CONFIGS[ACTIVE_PROVIDER.type],
			onProgress: progress => {
				this.logger.info('Slang detection progress', {
					processed: progress.processedItems,
					total: progress.totalItems,
					currentBatch: progress.currentBatch,
					failedBatches: progress.failedBatches,
				});
			},
		});

		context.tokens.enriched = context.tokens.enriched.map(originalToken => {
			if (originalToken.tokenType !== TokenType.Word) {
				return originalToken;
			}
			const enrichedToken = enrichedTokens.find(
				t => t.tokenId === originalToken.tokenId,
			);

			if (enrichedToken && 'isSlang' in enrichedToken) {
				return {
					...originalToken,
					isSlang: enrichedToken.isSlang,
					lastUpdated: Date.now(),
				};
			}
			return originalToken;
		});

		this.logger.info('Slang detection completed', {
			processedTokens: context.tokens.enriched.length,
			slangTokensFound: context.tokens.enriched.filter(
				(t): t is IWord => 'isSlang' in t && t.isSlang === true,
			).length,
		});

		this.logger.end('process');
		return context;
	}
}
