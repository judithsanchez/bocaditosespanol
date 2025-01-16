import {SpecializedEnricherStep} from '../SpecializedEnricher';
import {basicEnricherFixtures} from '../../../lib/fixtures';
import {SongProcessingContext} from '../../SongProcessingPipeline';
import {batchProcessor} from '../../../utils/batchProcessor';
import {
	enrichVerbTokens,
	enrichNounTokens,
	enrichAdjectiveTokens,
} from '../../../utils/index';

jest.mock('../../../utils/batchProcessor');
jest.mock('../../../utils/index');

// TODO: fix all failing

describe('SpecializedEnricherStep', () => {
	let enricher: SpecializedEnricherStep;
	let context: SongProcessingContext;

	beforeEach(() => {
		enricher = new SpecializedEnricherStep();
		context = {
			tokens: {
				enriched: basicEnricherFixtures.inputContext.tokens.all,
			},
		} as SongProcessingContext;

		(batchProcessor as jest.Mock).mockReset();
		(enrichVerbTokens as jest.Mock).mockReset();
		(enrichNounTokens as jest.Mock).mockReset();
		(enrichAdjectiveTokens as jest.Mock).mockReset();
	});

	describe('process', () => {
		it('successfully enriches verb tokens', async () => {
			const verbToken =
				basicEnricherFixtures.expectedEnrichedOutput.tokens.enriched[0];
			(batchProcessor as jest.Mock).mockResolvedValue([verbToken]);

			const result = await enricher.process(context);

			expect(result.tokens.enriched).toContainEqual(
				expect.objectContaining({
					partOfSpeech: 'verb',
					grammaticalInfo: expect.objectContaining({
						tense: expect.any(Array),
						mood: expect.any(String),
					}),
				}),
			);
		});

		it('successfully enriches noun tokens', async () => {
			const nounToken =
				basicEnricherFixtures.expectedEnrichedOutput.tokens.enriched[1];
			(batchProcessor as jest.Mock).mockResolvedValue([nounToken]);

			const result = await enricher.process(context);

			expect(result.tokens.enriched).toContainEqual(
				expect.objectContaining({
					partOfSpeech: 'noun',
					grammaticalInfo: expect.objectContaining({
						gender: expect.any(String),
						number: expect.any(String),
					}),
				}),
			);
		});

		it('maintains token order after enrichment', async () => {
			const enrichedTokens =
				basicEnricherFixtures.expectedEnrichedOutput.tokens.enriched;
			(batchProcessor as jest.Mock).mockResolvedValue(enrichedTokens);

			const result = await enricher.process(context);

			expect(result.tokens.enriched.map(t => t.tokenId)).toEqual(
				enrichedTokens.map(t => t.tokenId),
			);
		});

		it('respects rate limits between batch processing', async () => {
			const startTime = Date.now();
			await enricher.process(context);
			const endTime = Date.now();

			expect(endTime - startTime).toBeGreaterThanOrEqual(
				SpecializedEnricherStep['RATE_LIMITS'].DELAY_BETWEEN_BATCHES,
			);
		});

		it('processes multiple parts of speech in sequence', async () => {
			const mixedTokens = [
				...basicEnricherFixtures.expectedEnrichedOutput.tokens.enriched,
			];
			(batchProcessor as jest.Mock).mockResolvedValue(mixedTokens);

			const result = await enricher.process(context);

			expect(result.tokens.enriched).toEqual(
				expect.arrayContaining(mixedTokens),
			);
			expect(batchProcessor).toHaveBeenCalledTimes(
				Object.keys(mixedTokens).length,
			);
		});
	});
});
