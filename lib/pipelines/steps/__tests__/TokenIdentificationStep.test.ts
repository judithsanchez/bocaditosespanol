import {TokenIdentificationStep} from '../TokenIdentificationStep';
import {contentEntryDTMFBadBunny} from './fixtures';
import {ContentProcessingContext} from '@/lib/pipelines/ContentProcessingPipeline';
import {WriteDatabaseService} from '@/lib/services/WriteDatabaseService';
import {ISentence} from '@/lib/types/sentence';
import {IWord, IPunctuationSign} from '@/lib/types/token';

jest.mock('@/lib/services/WriteDatabaseService');

describe('TokenIdentificationStep', () => {
	let step: TokenIdentificationStep;
	let mockDb: jest.Mocked<WriteDatabaseService>;

	const createContextWithFormattedSentences = (
		sentences: ISentence[] = [
			{
				sentenceId: 'sentence-1-dtmf-bad-bunny',
				content: 'otro sunset bonito que veo en san juan.',
				translations: {english: {literal: '', contextual: ''}},
				tokenIds: [],
			},
			{
				sentenceId: 'sentence-2-dtmf-bad-bunny',
				content: 'disfrutando de todas esas cosas que extrañan los que se van.',
				translations: {english: {literal: '', contextual: ''}},
				tokenIds: [],
			},
		],
	): ContentProcessingContext => ({
		input: {
			content: contentEntryDTMFBadBunny.content,
			title: contentEntryDTMFBadBunny.title,
			contributors: {main: contentEntryDTMFBadBunny.contributors.main},
			contentType: contentEntryDTMFBadBunny.contentType,
			language: {
				main: contentEntryDTMFBadBunny.language.main,
				variant: contentEntryDTMFBadBunny.language.variant ?? [],
			},
			source: contentEntryDTMFBadBunny.source,
			genre: contentEntryDTMFBadBunny.genre,
		},
		sentences: {
			formatted: sentences,
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

	beforeEach(() => {
		jest.clearAllMocks();
		mockDb = new WriteDatabaseService() as jest.Mocked<WriteDatabaseService>;
		mockDb.filterExistingTokens = jest
			.fn()
			.mockImplementation(async tokens => ({
				existingTokens: [],
				newTokens: tokens,
			}));
		step = new TokenIdentificationStep(mockDb);
	});

	it('should process sentences and identify tokens', async () => {
		const context = createContextWithFormattedSentences();

		const result = await step.process(context);

		expect(result.sentences.formatted.length).toBe(2);
		expect(result.sentences.formatted[0].tokenIds.length).toBeGreaterThan(0);
		expect(result.sentences.formatted[1].tokenIds.length).toBeGreaterThan(0);

		expect(result.tokens.words.length).toBeGreaterThan(0);
		expect(result.tokens.punctuationSigns.length).toBeGreaterThan(0);

		expect(
			result.tokens.words.some((w: IWord) => w.content === 'sunset'),
		).toBeTruthy();
		expect(
			result.tokens.punctuationSigns.some(
				(p: IPunctuationSign) => p.content === '.',
			),
		).toBeTruthy();
		expect(result.sentences.formatted[0].tokenIds).toContain('token-sunset');
	});

	it('should handle empty formatted sentences gracefully', async () => {
		const context = createContextWithFormattedSentences([]);

		const result = await step.process(context);

		expect(result.sentences.formatted).toEqual([]);
		expect(result.tokens.words).toEqual([]);
		expect(result.tokens.punctuationSigns).toEqual([]);
	});

	it('should handle existing tokens in the database', async () => {
		const simpleSentences: ISentence[] = [
			{
				sentenceId: 's1',
				content: 'hola mundo.',
				translations: {english: {literal: '', contextual: ''}},
				tokenIds: [],
			},
			{
				sentenceId: 's2',
				content: 'hola otra vez.',
				translations: {english: {literal: '', contextual: ''}},
				tokenIds: [],
			},
		];
		const context = createContextWithFormattedSentences(simpleSentences);

		mockDb.filterExistingTokens = jest.fn().mockImplementation(async tokens => {
			const existingTokens = tokens.filter(
				(t: {tokenId: string}) => t.tokenId === 'word-hola',
			);
			const newTokens = tokens.filter(
				(t: {tokenId: string}) => t.tokenId !== 'word-hola',
			);
			return {existingTokens, newTokens};
		});

		const result = await step.process(context);

		expect(
			result.tokens.words.some((w: IWord) => w.content === 'hola'),
		).toBeTruthy();
		expect(
			result.tokens.words.some((w: IWord) => w.content === 'mundo'),
		).toBeTruthy();
		expect(
			result.tokens.words.some((w: IWord) => w.content === 'otra'),
		).toBeTruthy();
		expect(
			result.tokens.words.some((w: IWord) => w.content === 'vez'),
		).toBeTruthy();

		expect(result.sentences.formatted[0].tokenIds).toContain('token-hola');
		expect(result.sentences.formatted[0].tokenIds).toContain('token-mundo');
		expect(result.sentences.formatted[1].tokenIds).toContain('token-hola');
		expect(result.sentences.formatted[1].tokenIds).toContain('token-otra');
		expect(result.sentences.formatted[1].tokenIds).toContain('token-vez');
	});
});
