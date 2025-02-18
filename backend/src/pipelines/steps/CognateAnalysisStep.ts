import {PipelineStep} from '../Pipeline';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {Logger} from '../../utils/index';
import {BatchProcessor} from '../../utils/BatchProcessor';
import {IWord, TokenType} from '@bocaditosespanol/shared';
import {GenericAIEnricher} from '../../utils/GenericAIEnricher';
import {TokenAIEnrichmentFactory} from '../../factories/TokenAIEnrichmentFactory';
import {TokenAIEnrichmentInstructionFactory} from '../../factories/TokenAIEnrichmentInstructionFactory';
import {AIProviderFactory} from '../../factories/index';
import {
	ACTIVE_PROVIDER,
	AIStepType,
	PROVIDER_BATCH_CONFIGS,
} from '../../config/AIConfig';

export class CognateAnalysisStep
	implements PipelineStep<SongProcessingContext>
{
	private readonly logger = new Logger('CognateAnalysisStep');
	private readonly enricher: GenericAIEnricher;
	private readonly batchProcessor: BatchProcessor<IWord>;

	constructor() {
		const provider = AIProviderFactory.getInstance().getProvider(
			AIStepType.COGNATE_ANALYSIS,
		);
		this.enricher = new GenericAIEnricher(provider);
		const batchConfig = PROVIDER_BATCH_CONFIGS[ACTIVE_PROVIDER.type];
		this.batchProcessor = new BatchProcessor(batchConfig);
	}
	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');

		const wordTokens = context.tokens.enriched.filter(
			(token): token is IWord => token.tokenType === TokenType.Word,
		);

		this.logger.info('Starting cognate analysis', {
			tokensToAnalyze: wordTokens.length,
			firstToken: wordTokens[0]?.content,
			lastToken: wordTokens[wordTokens.length - 1]?.content,
		});

		const enrichedTokens = await this.batchProcessor.process({
			items: wordTokens,
			processingFn: async tokens => {
				const schema = TokenAIEnrichmentFactory.createCognateSchema();
				const instruction =
					TokenAIEnrichmentInstructionFactory.createCognateInstruction();

				return this.enricher.enrich({
					input: tokens,
					schema,
					instruction,
				});
			},
			batchSize: 10,
			options: PROVIDER_BATCH_CONFIGS[ACTIVE_PROVIDER.type],
			onProgress: progress => {
				this.logger.info('Cognate analysis progress', {
					processed: progress.processedItems,
					total: progress.totalItems,
					currentBatch: progress.currentBatch,
					failedBatches: progress.failedBatches,
				});
			},
		});

		context.tokens.enriched = context.tokens.enriched.map(originalToken => {
			const enrichedToken = enrichedTokens.find(
				t => t.tokenId === originalToken.tokenId,
			);

			if (enrichedToken) {
				return {
					...originalToken,
					isCognate: enrichedToken.isCognate,
					isFalseCognate: enrichedToken.isFalseCognate,
					lastUpdated: Date.now(),
				};
			}
			return originalToken;
		});

		this.logger.info('Cognate analysis completed', {
			analyzedTokens: context.tokens.enriched.length,
			cognatesFound: context.tokens.enriched.filter(
				(t): t is IWord => 'isCognate' in t && t.isCognate === true,
			).length,
			falseCognatesFound: context.tokens.enriched.filter(
				(t): t is IWord => 'isFalseCognate' in t && t.isFalseCognate === true,
			).length,
		});

		this.logger.end('process');
		return context;
	}
}
