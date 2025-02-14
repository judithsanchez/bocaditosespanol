import {PipelineStep} from '../Pipeline';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {Logger} from '../../utils/index';
import {batchProcessor} from '../../utils/batchProcessor';
import {IWord, TokenType} from '@bocaditosespanol/shared';
import {GenericAIEnricher} from '../../utils/GenericAIEnricher';
import {TokenAIEnrichmentFactory} from '../../factories/TokenAIEnrichmentFactory';
import {TokenAIEnrichmentInstructionFactory} from '../../factories/TokenAIEnrichmentInstructionFactory';
import {AIProvider} from '../../lib/types';

export class SensesEnrichmentStep
	implements PipelineStep<SongProcessingContext>
{
	private readonly logger = new Logger('SensesEnrichmentStep');
	private readonly enricher: GenericAIEnricher;

	constructor(aiProvider: AIProvider) {
		this.enricher = new GenericAIEnricher(aiProvider);
	}

	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');

		const wordTokens = context.tokens.newTokens.filter(
			(token): token is IWord => token.tokenType === TokenType.Word,
		);

		this.logger.info('Starting senses enrichment', {
			tokensToProcess: wordTokens.length,
			firstToken: wordTokens[0]?.content,
			lastToken: wordTokens[wordTokens.length - 1]?.content,
		});

		const enrichedTokens = await batchProcessor({
			items: wordTokens,
			processingFn: async tokens => {
				const schema = TokenAIEnrichmentFactory.createSenseSchema();
				const instruction =
					TokenAIEnrichmentInstructionFactory.createSensesInstruction();

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

		context.tokens.enriched = wordTokens.map(originalToken => {
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
