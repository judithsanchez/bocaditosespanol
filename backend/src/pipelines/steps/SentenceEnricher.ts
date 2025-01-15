import {PipelineStep} from '../Pipeline';
import {Logger} from '../../utils/index';
import {enrichSentencesWithAI} from '../../utils/index';
import {SongProcessingContext} from '../SongProcessingPipeline';

export class SentenceEnricherSteps
	implements PipelineStep<SongProcessingContext>
{
	private readonly logger = new Logger('SentenceEnricherStep');

	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');

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
