import {SentenceFormatterStep} from '../SentenceFormatterStep';
import {createBadBunnySongContext} from './fixtures';

describe('SentenceFormatterStep', () => {
	it('should process content into formatted sentences', async () => {
		const step = new SentenceFormatterStep();
		const context = createBadBunnySongContext();

		const result = await step.process(context);

		expect(result.sentences.formatted.length).toBeGreaterThan(0);
		expect(result.sentences.deduplicated.length).toBeGreaterThan(0);

		const firstSentence = result.sentences.formatted[0];
		expect(firstSentence.content).toBeDefined();
		expect(firstSentence.sentenceId).toContain('sentence-1-dtmf-bad-bunny');
		expect(firstSentence.translations.english.literal).toBe('');
		expect(firstSentence.translations.english.contextual).toBe('');
		expect(firstSentence.tokenIds).toEqual([]);
	});

	it('should deduplicate repeated sentences', async () => {
		const step = new SentenceFormatterStep();
		const context = createBadBunnySongContext();

		const result = await step.process(context);

		expect(result.sentences.formatted.length).toBeGreaterThan(0);

		expect(result.sentences.deduplicated.length).toBeLessThan(
			result.sentences.formatted.length,
		);

		const uniqueContents = new Set(
			result.sentences.deduplicated.map(s => s.content),
		);
		expect(uniqueContents.size).toBe(result.sentences.deduplicated.length);
	});
});
