import {PipelineStep} from '../Pipeline';
import {Logger} from '../../utils/Logger';
import {enrichSentencesWithAI} from '../../utils/enrichSentencesWithAI';
import {SongProcessingContext} from '../SongProcessingPipeline';

export class SentenceEnricherStep
	implements PipelineStep<SongProcessingContext>
{
	private readonly logger = new Logger('SentenceEnricherStep');

	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');

		// Enrich only deduplicated sentences
		context.sentences.enriched = await enrichSentencesWithAI(
			context.sentences.deduplicated,
		);

		this.logger.info('Sentence enrichment completed', {
			totalSentences: context.sentences.enriched.length,
		});

		this.logger.end('process');
		return context;
	}
}
