import {SentenceProcessorStep} from '../SentenceProcessor';
import {splitParagraphFixtures} from '../../../lib/fixtures';
import {SongProcessingContext} from '../../SongProcessingPipeline';
import {ISong} from 'lib/types';

describe('SentenceProcessorStep', () => {
	let processor: SentenceProcessorStep;
	let context: SongProcessingContext;

	beforeEach(() => {
		processor = new SentenceProcessorStep();
		context = {
			rawInput: {
				interpreter: 'Test Artist',
				title: 'Test Song',
				lyrics: splitParagraphFixtures.spanishSentences.input,
				spotify: 'https://spotify.com/test',
				genre: ['test'],
				language: 'es',
				releaseDate: '2023-01-01',
			},
			sentences: {
				raw: [],
				formatted: [],
				originalSentencesIds: [],
				deduplicated: [],
				enriched: [],
			},
			tokens: {
				all: [],
				words: [],
				deduplicated: [],
				enriched: [],
			},
			song: {} as ISong,
		};
	});

	describe('process', () => {
		it('successfully splits Spanish sentences with punctuation', async () => {
			const result = await processor.process(context);

			expect(result.sentences.raw).toEqual(
				splitParagraphFixtures.spanishSentences.expected,
			);
		});

		it('correctly formats sentences with IDs', async () => {
			const result = await processor.process(context);

			expect(result.sentences.formatted).toHaveLength(
				splitParagraphFixtures.spanishSentences.expected.length,
			);

			result.sentences.formatted.forEach(sentence => {
				expect(sentence).toMatchObject({
					sentenceId: expect.stringContaining('test-song-test-artist'),
					content: expect.any(String),
					translations: {
						english: {
							literal: '',
							contextual: '',
						},
					},
					tokenIds: [],
				});
			});
		});

		it('handles sentences with special characters correctly', async () => {
			context.rawInput.lyrics = splitParagraphFixtures.specialCharacters.input;
			const result = await processor.process(context);

			expect(result.sentences.raw).toEqual(
				splitParagraphFixtures.specialCharacters.expected,
			);
		});

		it('deduplicates identical sentences while preserving order', async () => {
			context.rawInput.lyrics = 'Hola mundo. Adiós mundo. Hola mundo.';
			const result = await processor.process(context);

			expect(result.sentences.deduplicated).toHaveLength(2);
			expect(result.sentences.formatted).toHaveLength(3);
			expect(result.sentences.originalSentencesIds).toHaveLength(3);
		});
	});
});
