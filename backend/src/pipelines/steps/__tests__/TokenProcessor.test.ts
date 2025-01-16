import {TokenProcessorStep} from '../TokenProcessor';
import {tokenProcessorFixtures} from '../../../lib/fixtures';
import {SongProcessingContext} from '../../SongProcessingPipeline';

describe('TokenProcessorStep', () => {
	let processor: TokenProcessorStep;
	let context: SongProcessingContext;

	beforeEach(() => {
		processor = new TokenProcessorStep();
		context = {
			rawInput: {} as any,
			sentences: {
				raw: [],
				formatted: [...tokenProcessorFixtures.basicContext.sentences.formatted],
				originalSentencesIds: [],
				deduplicated: [
					...tokenProcessorFixtures.basicContext.sentences.deduplicated,
				],
				enriched: [],
			},
			tokens: {
				all: [],
				words: [],
				deduplicated: [],
				enriched: [],
			},
			song: {} as any,
		};
	});

	describe('process', () => {
		it('should process basic sentences correctly', async () => {
			const result = await processor.process(context);
			expect(result.tokens.all).toHaveLength(3);
			expect(result.sentences.formatted[0].tokenIds).toHaveLength(3);
		});

		it('should handle sentences with emojis', async () => {
			context.sentences.formatted[0].content =
				tokenProcessorFixtures.tokenizationCases.withEmojis.input;
			context.sentences.deduplicated[0].content =
				tokenProcessorFixtures.tokenizationCases.withEmojis.input;

			const result = await processor.process(context);
			expect(result.tokens.all).toHaveLength(5);
			expect(
				result.tokens.all.filter(t => t.tokenType === 'emoji'),
			).toHaveLength(2);
		});

		it('should process special characters correctly', async () => {
			context.sentences.formatted[0].content =
				tokenProcessorFixtures.tokenizationCases.withSpecialChars.input;
			context.sentences.deduplicated[0].content =
				tokenProcessorFixtures.tokenizationCases.withSpecialChars.input;

			const result = await processor.process(context);
			const specialCharWords = result.tokens.all.filter(
				t => t.tokenType === 'word' && (t as any).hasSpecialChar,
			);
			expect(specialCharWords).toHaveLength(1);
		});

		it('should maintain token references in deduplicated sentences', async () => {
			const result = await processor.process(context);
			expect(result.sentences.formatted[0].tokenIds).toEqual(
				result.sentences.deduplicated[0].tokenIds,
			);
		});
	});
});
