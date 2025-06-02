import {PipelineStep} from '../Pipeline';
import {ContentProcessingContext} from '../ContentProcessingPipeline';
import {Logger} from '../../utils/index';
import {BatchProcessor} from '../../utils/BatchProcessor';
import {IWord, TokenType} from '@/lib/types/token';
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
	implements PipelineStep<ContentProcessingContext>
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
		context: ContentProcessingContext,
	): Promise<ContentProcessingContext> {
		this.logger.start('process');

		if (!context.contentType) {
			throw new Error(
				'ContentType is missing in the processing context. CognateAnalysisStep cannot proceed.',
			);
		}

		const wordTokens = context.tokens.enriched.filter(
			(token): token is IWord => token.tokenType === TokenType.Word,
		);

		if (wordTokens.length === 0) {
			this.logger.info('No word tokens found to analyze for cognates.');
			this.logger.end('process');
			return context;
		}

		this.logger.info('Starting cognate analysis', {
			contentType: context.contentType,
			tokensToAnalyze: wordTokens.length,
			firstToken: wordTokens[0]?.content,
			lastToken: wordTokens[wordTokens.length - 1]?.content,
		});

		type CognateAIResponse = Pick<
			IWord,
			'tokenId' | 'isCognate' | 'isFalseCognate'
		>;

		const enrichedTokens = await this.batchProcessor.process({
			items: wordTokens,
			processingFn: async (batchItems: IWord[]): Promise<IWord[]> => {
				const schema = TokenAIEnrichmentFactory.createCognateSchema();
				const instruction =
					TokenAIEnrichmentInstructionFactory.createCognateInstruction();

				const aiResult = await this.enricher.enrich({
					input: batchItems.map(t => ({
						tokenId: t.tokenId,
						content: t.content,
					})),
					schema,
					instruction,
				});

				if (!Array.isArray(aiResult)) {
					this.logger.error('AI enrichment did not return an array.', {
						aiResult,
					});
					return batchItems;
				}

				const aiResultMap = new Map<string, CognateAIResponse>(
					(aiResult as any[]).map(item => [
						item.tokenId,
						{
							tokenId: item.tokenId,
							isCognate: item.isCognate ?? false,
							isFalseCognate: item.isFalseCognate ?? false,
						},
					]),
				);

				const updatedBatchItems = batchItems.map(originalToken => {
					const enrichedData = aiResultMap.get(originalToken.tokenId);
					if (enrichedData) {
						return {
							...originalToken,
							isCognate: enrichedData.isCognate,
							isFalseCognate: enrichedData.isFalseCognate,
						};
					}
					return originalToken;
				});

				return updatedBatchItems;
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

		const enrichedTokenMap = new Map<string, IWord>(
			enrichedTokens.map(t => [t.tokenId, t]),
		);

		context.tokens.enriched = context.tokens.enriched.map(originalToken => {
			const enrichedData = enrichedTokenMap.get(originalToken.tokenId);

			if (
				enrichedData &&
				originalToken.tokenType === TokenType.Word &&
				(originalToken.isCognate !== enrichedData.isCognate ||
					originalToken.isFalseCognate !== enrichedData.isFalseCognate)
			) {
				return {
					...originalToken,
					isCognate: enrichedData.isCognate,
					isFalseCognate: enrichedData.isFalseCognate,
					// Don't update lastUpdated for existing tokens
					lastUpdated: originalToken.lastUpdated || Date.now(),
				};
			}
			return originalToken;
		});

		this.logger.info('Cognate analysis completed', {
			analyzedTokens: context.tokens.enriched.length,
			cognatesFound: context.tokens.enriched.filter(
				(t): t is IWord =>
					t.tokenType === TokenType.Word && t.isCognate === true,
			).length,
			falseCognatesFound: context.tokens.enriched.filter(
				(t): t is IWord =>
					t.tokenType === TokenType.Word && t.isFalseCognate === true,
			).length,
		});

		this.logger.end('process');
		return context;
	}
}
