import {PipelineStep} from '../Pipeline';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {Logger} from '../../utils/index';
import {BatchProcessor} from '../../utils/BatchProcessor';
import {GenericAIEnricher} from '../../utils/GenericAIEnricher';
import {TokenAIEnrichmentFactory} from '../../factories/TokenAIEnrichmentFactory';
import {TokenAIEnrichmentInstructionFactory} from '../../factories/TokenAIEnrichmentInstructionFactory';
import {AIProvider} from '../../lib/types';
import {IWord, TokenType} from '@bocaditosespanol/shared';

export class SlangDetectionStep implements PipelineStep<SongProcessingContext> {
	private readonly logger = new Logger('SlangDetectionStep');
	private readonly enricher: GenericAIEnricher;
	private readonly batchProcessor: BatchProcessor<IWord>;

	constructor(aiProvider: AIProvider) {
		this.enricher = new GenericAIEnricher(aiProvider);
		this.batchProcessor = new BatchProcessor();
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
			processingFn: async tokens => {
				const schema = TokenAIEnrichmentFactory.createSlangSchema();
				const instruction =
					TokenAIEnrichmentInstructionFactory.createSlangInstruction();
				return this.enricher.enrich({
					input: tokens,
					schema,
					instruction,
				});
			},
			batchSize: 10,
			options: {
				retryAttempts: 3,
				delayBetweenBatches: 6000,
				maxRequestsPerMinute: 1,
				timeoutMs: 30000,
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
