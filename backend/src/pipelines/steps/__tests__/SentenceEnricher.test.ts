import {SentenceEnricherSteps} from '../SentenceEnricher';
import {sentenceEnricherFixtures} from '../../../lib/fixtures';
import {SongProcessingContext} from '../../SongProcessingPipeline';
import {batchProcessor} from '../../../utils/batchProcessor';
import {enrichSentencesWithAI} from '../../../utils/index';

jest.mock('../../../utils/batchProcessor');
jest.mock('../../../utils/index');

describe('SentenceEnricherSteps', () => {
	let enricher: SentenceEnricherSteps;
	let context: SongProcessingContext;

	beforeEach(() => {
		enricher = new SentenceEnricherSteps();
		context = {
			...sentenceEnricherFixtures.inputContext,
		} as SongProcessingContext;

		(batchProcessor as jest.Mock).mockReset();
		(enrichSentencesWithAI as jest.Mock).mockReset();
	});

	describe('process', () => {
		it('successfully enriches sentences with translations', async () => {
			(batchProcessor as jest.Mock).mockResolvedValue(
				sentenceEnricherFixtures.mockResponses.enrichedSentences,
			);

			const result = await enricher.process(context);

			expect(result.sentences.enriched).toEqual(
				sentenceEnricherFixtures.mockResponses.enrichedSentences,
			);
			expect(batchProcessor).toHaveBeenCalledWith({
				items: sentenceEnricherFixtures.inputContext.sentences.deduplicated,
				processingFn: enrichSentencesWithAI,
				batchSize: 5,
				options: {
					retryAttempts: 3,
					delayBetweenBatches: 6000,
					maxRequestsPerMinute: 1,
				},
			});
		});
	});
});
