import {PipelineStep} from '../Pipeline';
import {ContentProcessingContext} from '../ContentProcessingPipeline';
import {Logger} from '../../utils/index';
import {BatchProcessor} from '../../utils/BatchProcessor'; // Removed BatchOptions import
import {GenericAIEnricher} from '../../utils/GenericAIEnricher';
import {TokenAIEnrichmentFactory} from '../../factories/TokenAIEnrichmentFactory';
import {TokenAIEnrichmentInstructionFactory} from '../../factories/TokenAIEnrichmentInstructionFactory';
import {IWord, TokenType, Token} from '@/lib/types/token';
import {AIProviderFactory} from '../../factories/index';
import {
	ACTIVE_PROVIDER,
	AIStepType,
	PROVIDER_BATCH_CONFIGS,
	BatchOptions, // Re-import BatchOptions from AIConfig to define the type of batchConfig
} from '../../config/AIConfig';

// Define the expected AI response structure for this step
type SlangAIResponse = Pick<IWord, 'tokenId' | 'isSlang'>;

// Define an inline type for the progress object
type SlangBatchProgress = {
	processedItems: number;
	totalItems: number;
	currentBatch: number;
	failedBatches: number;
};

// Define an inline type for the nested options expected by BatchProcessor.process
// based on batchOptionsSchema in BatchProcessor.ts
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
	private readonly batchProcessor: BatchProcessor<IWord>; // Expects IWord input/output

	constructor() {
		const provider = AIProviderFactory.getInstance().getProvider(
			AIStepType.SLANG_DETECTION,
		);
		this.enricher = new GenericAIEnricher(provider);
		// The constructor expects the full BatchOptions type from AIConfig
		const constructorOptions: BatchOptions =
			PROVIDER_BATCH_CONFIGS[ACTIVE_PROVIDER.type];
		this.batchProcessor = new BatchProcessor(constructorOptions);
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

		// Get the full batch config (type BatchOptions from AIConfig)
		const fullBatchConfig: BatchOptions =
			PROVIDER_BATCH_CONFIGS[ACTIVE_PROVIDER.type];

		// Construct the nested 'options' object required by BatchProcessor.process
		// containing only the fields defined in batchOptionsSchema
		const processOptions: ProcessOptions = {
			retryAttempts: fullBatchConfig.retryAttempts,
			delayBetweenBatches: fullBatchConfig.delayBetweenBatches,
			maxRequestsPerMinute: fullBatchConfig.maxRequestsPerMinute,
			...(fullBatchConfig.timeoutMs && {timeoutMs: fullBatchConfig.timeoutMs}),
			...(fullBatchConfig.maxConcurrentBatches && {
				maxConcurrentBatches: fullBatchConfig.maxConcurrentBatches,
			}),
		};

		// Process tokens in batches using the structure defined by BatchConfig<T>
		const processedTokens = await this.batchProcessor.process({
			items: wordTokens,
			batchSize: fullBatchConfig.batchSize, // Top-level batchSize
			options: processOptions, // Pass the explicitly constructed nested options
			// processingFn now returns Promise<IWord[]>
			processingFn: async (batch: IWord[]): Promise<IWord[]> => {
				const schema = TokenAIEnrichmentFactory.createSlangSchema();
				const instruction =
					TokenAIEnrichmentInstructionFactory.createSlangInstruction();
				let slangResults: SlangAIResponse[] = [];
				try {
					// Explicitly cast the result of enrich
					const results = (await this.enricher.enrich({
						input: batch,
						schema,
						instruction,
					})) as SlangAIResponse[] | null | undefined; // Cast here
					slangResults = results ?? [];
				} catch (error) {
					this.logger.error('Error during AI enrichment batch', {
						error: error instanceof Error ? error.message : String(error),
						batchSize: batch.length, // Use the actual batch length here for logging
					});
					// Return original batch items on error
					return batch;
				}

				// Create a map for efficient lookup within the batch
				const slangResultMap = new Map<string, SlangAIResponse>(
					slangResults.map(result => [result.tokenId, result]),
				);

				// Merge results into the batch items
				return batch.map(originalToken => {
					const enrichedData = slangResultMap.get(originalToken.tokenId);
					if (enrichedData && originalToken.isSlang !== enrichedData.isSlang) {
						return {
							...originalToken,
							isSlang: enrichedData.isSlang,
							lastUpdated: Date.now(),
						};
					}
					return originalToken; // Return original if no change or no data
				});
			},
			onProgress: (progress: SlangBatchProgress) => {
				// Use the inline type
				this.logger.info('Slang detection progress', {
					processed: progress.processedItems,
					total: progress.totalItems,
					currentBatch: progress.currentBatch,
					failedBatches: progress.failedBatches,
				});
			},
		});

		// Create a map of the processed tokens for efficient update
		const processedTokenMap = new Map<string, IWord>(
			processedTokens.map(token => [token.tokenId, token]),
		);

		// Update the main context.tokens.enriched array
		context.tokens.enriched = context.tokens.enriched.map(originalToken => {
			// If it's a word token that was processed, return the updated version
			if (
				originalToken.tokenType === TokenType.Word &&
				processedTokenMap.has(originalToken.tokenId)
			) {
				return processedTokenMap.get(originalToken.tokenId)!; // Non-null assertion ok due to has check
			}
			// Otherwise, return the original token (non-word or word not processed in this step)
			return originalToken;
		});

		this.logger.info('Slang detection completed', {
			processedTokens: context.tokens.enriched.length,
			slangTokensFound: context.tokens.enriched.filter(
				(t): t is IWord => t.tokenType === TokenType.Word && t.isSlang === true,
			).length,
		});

		this.logger.end('process');
		return context;
	}
}
