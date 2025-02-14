import {PipelineStep} from '../Pipeline';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {Logger} from '../../utils/index';
import {batchProcessor} from '../../utils/batchProcessor';
import {GenericAIEnricher} from '../../utils/GenericAIEnricher';
import {TokenAIEnrichmentFactory} from '../../factories/TokenAIEnrichmentFactory';
import {TokenAIEnrichmentInstructionFactory} from '../../factories/TokenAIEnrichmentInstructionFactory';
import {AIProvider} from '../../lib/types';
import {IWord} from '@bocaditosespanol/shared';

export class SlangDetectionStep implements PipelineStep<SongProcessingContext> {
	private readonly logger = new Logger('SlangDetectionStep');
	private readonly enricher: GenericAIEnricher;

	constructor(aiProvider: AIProvider) {
		this.enricher = new GenericAIEnricher(aiProvider);
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

		const enrichedTokens = await batchProcessor({
			items: context.tokens.enriched,
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
			},
		});

		context.tokens.enriched = context.tokens.enriched.map(originalToken => {
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
