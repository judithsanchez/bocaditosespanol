import {PipelineStep} from '../Pipeline';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {Logger} from '../../utils/index';
import {batchProcessor} from '../../utils/batchProcessor';
import {GenericAIEnricher} from '../../utils/GenericAIEnricher';
import {TokenAIEnrichmentFactory} from '../../factories/TokenAIEnrichmentFactory';
import {TokenAIEnrichmentInstructionFactory} from '../../factories/TokenAIEnrichmentInstructionFactory';
import {AIProvider} from '../../lib/types';

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

		context.tokens.enriched = enrichedTokens.map(token => ({
			...token,
			lastUpdated: Date.now(),
		}));
		this.logger.end('process');
		return context;
	}
}
