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

		context.tokens.enriched = enrichedTokens.map(token => {
			if ('senses' in token && token.senses) {
				return {
					...token,
					tokenType: TokenType.Word,
					lastUpdated: Date.now(),
					senses: token.senses.map(sense => ({
						...sense,
						senseId: `sense-${sense.partOfSpeech}-${token.content}`,
						lastUpdated: Date.now(),
					})),
				} as IWord;
			}
			return {
				...token,
				lastUpdated: Date.now(),
			};
		});

		// this.logger.info('Updated enriched tokens:', {
		// 	tokens: JSON.stringify(context.tokens.enriched, null, 2),
		// });
		this.logger.end('process');
		return context;
	}
}
