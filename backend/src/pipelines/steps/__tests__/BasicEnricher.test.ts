import {BasicEnricherStep} from '../BasicEnricher';
import {SongProcessingContext} from '../../SongProcessingPipeline';
import {batchProcessor} from '../../../utils/batchProcessor';
import {enrichWordTokens} from '../../../utils/enrichWordTokens';
import {IWord} from 'lib/types';
import {basicEnricherFixtures} from 'lib/fixtures';

jest.mock('../../../utils/batchProcessor');
jest.mock('../../../utils/enrichWordTokens');
jest.mock('../../../utils/index');

// TODO: fix first 2 cases
describe('BasicEnricherStep', () => {
	let enricher: BasicEnricherStep;
	let context: SongProcessingContext;

	beforeEach(() => {
		enricher = new BasicEnricherStep();
		// @ts-expect-error: emptyContext is intentionally missing properties for this test
		context = {
			...basicEnricherFixtures.inputContext,
		} as SongProcessingContext;

		(batchProcessor as jest.Mock).mockReset();
		(enrichWordTokens as jest.Mock).mockReset();
	});

	describe('process', () => {
		it('successfully enriches tokens with grammatical information', async () => {
			(batchProcessor as jest.Mock).mockResolvedValue(
				basicEnricherFixtures.expectedEnrichedOutput.tokens.enriched,
			);

			const result = await enricher.process(context);

			expect(result.tokens.enriched).toEqual(
				basicEnricherFixtures.expectedEnrichedOutput.tokens.enriched,
			);
			expect(batchProcessor).toHaveBeenCalledWith({
				items: expect.any(Array),
				processingFn: enrichWordTokens,
				batchSize: basicEnricherFixtures.rateLimits.BATCH_SIZE,
				options: {
					retryAttempts: basicEnricherFixtures.rateLimits.RETRY_ATTEMPTS,
					delayBetweenBatches:
						basicEnricherFixtures.rateLimits.DELAY_BETWEEN_BATCHES,
					maxRequestsPerMinute:
						basicEnricherFixtures.rateLimits.REQUESTS_PER_MINUTE,
				},
			});
		});

		it('correctly handles empty token list', async () => {
			// @ts-expect-error: emptyContext is intentionally missing properties for this test
			const emptyContext = {
				tokens: {all: []},
			} as SongProcessingContext;

			const result = await enricher.process(emptyContext);
			expect(result.tokens.enriched).toEqual([]);
		});

		it('preserves non-word tokens in the output', async () => {
			(batchProcessor as jest.Mock).mockResolvedValue([]);

			const result = await enricher.process(context);
			const punctuationTokens = result.tokens.enriched.filter(
				token => token.tokenType === 'punctuationSign',
			);
			expect(punctuationTokens).toHaveLength(1);
		});
	});

	describe('grammatical structure', () => {
		it('adds verb grammatical structure correctly', async () => {
			const verbToken =
				basicEnricherFixtures.expectedEnrichedOutput.tokens.enriched[0];
			(batchProcessor as jest.Mock).mockResolvedValue([verbToken]);

			const result = await enricher.process(context);
			expect((result.tokens.enriched[0] as IWord).grammaticalInfo).toEqual({
				tense: [],
				mood: '',
				person: [],
				number: '',
				isRegular: false,
				infinitive: '',
				voice: '',
				verbClass: '',
				gerund: false,
				pastParticiple: false,
				verbRegularity: '',
				isReflexive: false,
			});
		});

		it('adds noun grammatical structure correctly', async () => {
			const nounToken =
				basicEnricherFixtures.expectedEnrichedOutput.tokens.enriched[1];
			(batchProcessor as jest.Mock).mockResolvedValue([nounToken]);

			const result = await enricher.process(context);
			expect((result.tokens.enriched[0] as IWord).grammaticalInfo).toEqual({
				gender: '',
				number: '',
				isProperNoun: false,
				diminutive: false,
			});
		});

		it('handles unknown part of speech correctly', async () => {
			const unknownToken = basicEnricherFixtures.edgeCases.unknownPartOfSpeech;
			(batchProcessor as jest.Mock).mockResolvedValue([unknownToken]);

			// @ts-expect-error: emptyContext is intentionally missing properties for this test

			const result = await enricher.process({
				tokens: {all: [unknownToken]},
			} as SongProcessingContext);

			expect((result.tokens.enriched[0] as IWord).grammaticalInfo).toEqual({});
		});
	});

	describe('part of speech statistics', () => {
		it('generates correct statistics for mixed parts of speech', async () => {
			(batchProcessor as jest.Mock).mockResolvedValue(
				basicEnricherFixtures.posStats.input,
			);

			const result = await enricher.process({
				tokens: {all: basicEnricherFixtures.posStats.input},
			} as SongProcessingContext);

			// Access private method for testing statistics
			const stats = (enricher as any).getPartOfSpeechStats(
				result.tokens.enriched,
			);
			expect(stats).toEqual(basicEnricherFixtures.posStats.expected);
		});
	});

	describe('error handling', () => {
		it('handles batch processor errors gracefully', async () => {
			(batchProcessor as jest.Mock).mockRejectedValue(
				new Error('Batch processing failed'),
			);

			await expect(enricher.process(context)).rejects.toThrow(
				'Batch processing failed',
			);
		});
	});
});
