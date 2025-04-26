import {SentenceFormatterStep} from '../SentenceFormatterStep';
import {contentEntryDTMFBadBunny} from './fixtures';
import {ContentProcessingContext} from '@/lib/pipelines/ContentProcessingPipeline';

describe('SentenceFormatterStep', () => {
	const createContext = (
		content: string = contentEntryDTMFBadBunny.content,
	): ContentProcessingContext => ({
		input: {
			content: content,
			title: contentEntryDTMFBadBunny.title,
			contributors: {
				main: contentEntryDTMFBadBunny.contributors.main,
			},
			contentType: contentEntryDTMFBadBunny.contentType,
			language: {
				main: contentEntryDTMFBadBunny.language.main,
				variant: contentEntryDTMFBadBunny.language.variant ?? [],
			},
			source: contentEntryDTMFBadBunny.source,
			genre: contentEntryDTMFBadBunny.genre,
		},
		sentences: {
			formatted: [],
			deduplicated: [],
			enriched: [],
		},
		tokens: {
			words: [],
			punctuationSigns: [],
			emojis: [],
			deduplicated: [],
			enriched: [],
		},
		contentType: contentEntryDTMFBadBunny.contentType,
	});

	it('should process content into formatted sentences', async () => {
		const step = new SentenceFormatterStep();
		const context = createContext();

		const result = await step.process(context);

		const expectedFormattedSentences = [
			'otro sunset bonito que veo en san juan.',
			'disfrutando de todas esas cosas que extrañan los que se van.',
		];

		expect(result.sentences.formatted.length).toBe(
			expectedFormattedSentences.length,
		);
		expect(result.sentences.deduplicated.length).toBe(
			expectedFormattedSentences.length,
		);

		const firstSentence = result.sentences.formatted[0];
		expect(firstSentence.content).toBe(expectedFormattedSentences[0]);
		expect(firstSentence.sentenceId).toBe('sentence-1-dtmf-bad-bunny');
		expect(firstSentence.translations.english.literal).toBe('');
		expect(firstSentence.translations.english.contextual).toBe('');
		expect(firstSentence.tokenIds).toEqual([]);

		const secondSentence = result.sentences.formatted[1];
		expect(secondSentence.content).toBe(expectedFormattedSentences[1]);
		expect(secondSentence.sentenceId).toBe('sentence-2-dtmf-bad-bunny');
	});

	it('should deduplicate repeated sentences', async () => {
		const step = new SentenceFormatterStep();
		const duplicateContent = `${contentEntryDTMFBadBunny.content} ${
			contentEntryDTMFBadBunny.content.split('.')[0]
		}.`;
		const context = createContext(duplicateContent);

		const result = await step.process(context);

		expect(result.sentences.formatted.length).toBe(3);
		expect(result.sentences.deduplicated.length).toBe(2);

		expect(result.sentences.deduplicated.length).toBeLessThan(
			result.sentences.formatted.length,
		);

		const uniqueContents = new Set(
			result.sentences.deduplicated.map(s => s.content),
		);
		expect(uniqueContents.size).toBe(result.sentences.deduplicated.length);
		expect(Array.from(uniqueContents)).toEqual([
			'otro sunset bonito que veo en san juan.',
			'disfrutando de todas esas cosas que extrañan los que se van.',
		]);
	});
});
