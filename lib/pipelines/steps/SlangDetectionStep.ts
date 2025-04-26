import {PipelineStep} from '../Pipeline';
import {ContentProcessingContext} from '../ContentProcessingPipeline';
import {Logger} from '../../utils/index';
import {BatchProcessor} from '../../utils/BatchProcessor';
import {GenericAIEnricher} from '../../utils/GenericAIEnricher';
import {TokenAIEnrichmentFactory} from '../../factories/TokenAIEnrichmentFactory';
import {TokenAIEnrichmentInstructionFactory} from '../../factories/TokenAIEnrichmentInstructionFactory';
import {IWord, TokenType, Token} from '@/lib/types/token';
import {AIProviderFactory} from '../../factories/index';
import {
	ACTIVE_PROVIDER,
	AIStepType,
	PROVIDER_BATCH_CONFIGS,
	BatchOptions,
} from '../../config/AIConfig';

type SlangAIResponse = Pick<IWord, 'tokenId' | 'isSlang'>;

type SlangBatchProgress = {
	processedItems: number;
	totalItems: number;
	currentBatch: number;
	failedBatches: number;
};

type ProcessOptions = {
	retryAttempts: number;
	delayBetweenBatches: number;
	maxRequestsPerMinute: number;
	timeoutMs?: number;
	maxConcurrentBatches?: number;
};

export class SlangDetectionStep
	implements PipelineStep<ContentProcessingContext>
{
	private readonly logger = new Logger('SlangDetectionStep');
	private readonly enricher: GenericAIEnricher;
	private readonly batchProcessor: BatchProcessor<IWord>;
	private readonly batchConfig = PROVIDER_BATCH_CONFIGS[ACTIVE_PROVIDER.type];

	constructor() {
		const provider = AIProviderFactory.getInstance().getProvider(
			AIStepType.SLANG_DETECTION,
		);
		this.enricher = new GenericAIEnricher(provider);
		this.batchProcessor = new BatchProcessor(this.batchConfig);
	}

	async process(
		context: ContentProcessingContext,
	): Promise<ContentProcessingContext> {
		this.logger.start('process');

		const wordTokens = context.tokens.enriched.filter(
			(token): token is IWord => token.tokenType === TokenType.Word,
		);

		if (wordTokens.length === 0) {
			this.logger.info('No word tokens found to process for slang detection.');
			this.logger.end('process');
			return context;
		}

		this.logger.info('Starting slang detection', {
			tokensToProcess: wordTokens.length,
			firstToken: wordTokens[0]?.content,
			lastToken: wordTokens[wordTokens.length - 1]?.content,
		});

		try {
			const processedTokens = await this.batchProcessor.process({
				items: wordTokens,
				batchSize: this.batchConfig.batchSize,
				options: this.batchConfig,
				processingFn: async (batch: IWord[]): Promise<IWord[]> => {
					const schema = TokenAIEnrichmentFactory.createSlangSchema();
					const instruction =
						TokenAIEnrichmentInstructionFactory.createSlangInstruction();
					let slangResults: SlangAIResponse[] = [];
					try {
						const results = (await this.enricher.enrich({
							input: batch,
							schema,
							instruction,
						})) as SlangAIResponse[] | null | undefined;
						slangResults = results ?? [];
					} catch (error) {
						this.logger.error('Error during AI enrichment batch', {
							error: error instanceof Error ? error.message : String(error),
							batchSize: batch.length,
						});
						return batch;
					}

					const slangResultMap = new Map<string, SlangAIResponse>(
						slangResults.map(result => [result.tokenId, result]),
					);

					return batch.map(originalToken => {
						const enrichedData = slangResultMap.get(originalToken.tokenId);
						if (
							enrichedData &&
							originalToken.isSlang !== enrichedData.isSlang
						) {
							return {
								...originalToken,
								isSlang: enrichedData.isSlang,
								lastUpdated: Date.now(),
							};
						}
						return originalToken;
					});
				},
				onProgress: progress => {
					this.logger.info('Slang detection progress', {
						processed: progress.processedItems,
						total: progress.totalItems,
						currentBatch: progress.currentBatch,
						failedBatches: progress.failedBatches,
					});
				},
			});

			const processedTokenMap = new Map<string, IWord>(
				processedTokens.map(token => [token.tokenId, token]),
			);

			context.tokens.enriched = context.tokens.enriched.map(originalToken => {
				if (
					originalToken.tokenType === TokenType.Word &&
					processedTokenMap.has(originalToken.tokenId)
				) {
					return processedTokenMap.get(originalToken.tokenId)!;
				}
				return originalToken;
			});

			this.logger.info('Slang detection completed', {
				processedTokens: context.tokens.enriched.length,
				slangTokensFound: context.tokens.enriched.filter(
					(t): t is IWord =>
						t.tokenType === TokenType.Word && t.isSlang === true,
				).length,
			});
		} catch (error) {
			this.logger.error('Slang detection failed', error);
			throw new Error(
				`Slang detection failed: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}

		this.logger.end('process');
		return context;
	}
}
