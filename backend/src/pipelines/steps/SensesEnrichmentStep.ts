import {PipelineStep} from '../Pipeline';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {Logger} from '../../utils/index';
import {batchProcessor} from '../../utils/batchProcessor';
import {IWord} from '@bocaditosespanol/shared';
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

		this.logger.info('Starting senses enrichment', {
			tokensToProcess: context.tokens.words.length,
			firstToken: context.tokens.words[0]?.content,
			lastToken: context.tokens.words[context.tokens.words.length - 1]?.content,
		});

		const enrichedTokens = await batchProcessor({
			items: context.tokens.words,
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
