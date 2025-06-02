import {ReadDatabaseService} from '../ReadDatabaseService';
import {DatabaseConfig} from '../../config/DatabaseConfig';
import {TokenStorage, TextEntriesStorage} from '../../types/database';
import {IWord, TokenType, IPunctuationSign} from '../../types/token';
import {ISentence} from '../../types/sentence';
import {ContentType, ISong} from '../../types/content';

const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('ReadDatabaseService', () => {
	let service: ReadDatabaseService;

	beforeEach(() => {
		mockFetch.mockClear();
		(console.log as jest.Mock).mockClear();
		(console.warn as jest.Mock).mockClear();
		(console.error as jest.Mock).mockClear();

		service = new ReadDatabaseService();
	});

	describe('readFile', () => {
		it('should return parsed JSON on successful fetch', async () => {
			const mockData = {success: true};
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockData,
			} as Response);

			const result = await service.readFile('test.json');
			expect(result).toEqual(mockData);
			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(mockFetch).toHaveBeenCalledWith(
				`${DatabaseConfig.paths.githubPages}/test.json`,
			);
			expect(console.error).not.toHaveBeenCalled();
		});

		it('should return null and log warning on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 404,
			} as Response);

			const result = await service.readFile('not-found.json');
			expect(result).toBeNull();
			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('HTTP error fetching'),
			);
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Failed to fetch or parse'),
				'HTTP error! status: 404',
			);
		});

		it('should return null and log error on fetch network error', async () => {
			const networkError = new Error('Network failed');
			mockFetch.mockRejectedValueOnce(networkError);

			const result = await service.readFile('network-error.json');
			expect(result).toBeNull();
			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Failed to fetch or parse'),
				networkError.message,
			);
		});

		it('should return null and log error on invalid JSON', async () => {
			const jsonError = new SyntaxError('Unexpected token < in JSON');
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: jest.fn().mockRejectedValueOnce(jsonError),
			} as unknown as Response);

			const result = await service.readFile('invalid-json.json');
			expect(result).toBeNull();
			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Failed to fetch or parse'),
				jsonError.message,
			);
		});
	});

	describe('getTokens', () => {
		const mockWord1: IWord = {
			tokenId: 'w1',
			tokenType: TokenType.Word,
			content: 'hello',
			normalizedToken: 'hello',
			isSlang: false,
			isCognate: false,
			isFalseCognate: false,
			lastUpdated: 100,
			senses: [],
		};
		const mockWord2: IWord = {
			tokenId: 'w2',
			tokenType: TokenType.Word,
			content: 'world',
			normalizedToken: 'world',
			isSlang: false,
			isCognate: false,
			isFalseCognate: false,
			lastUpdated: 200,
			senses: [],
		};
		const mockPunc: IPunctuationSign = {
			tokenId: 'p1',
			tokenType: TokenType.PunctuationSign,
			content: '.',
		};
		const mockTokenData: TokenStorage = {
			words: {w1: mockWord1, w2: mockWord2},
			punctuationSigns: {p1: mockPunc},
			emojis: {},
		};

		it('should fetch, parse, combine, and sort tokens successfully', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockTokenData,
			} as Response);

			const tokens = await service.getTokens();

			expect(mockFetch).toHaveBeenCalledWith(
				`${DatabaseConfig.paths.githubPages}/${DatabaseConfig.files.tokens}`,
			);
			expect(tokens).toHaveLength(3);
			expect(tokens[0]).toEqual(mockWord2);
			expect(tokens[1]).toEqual(mockWord1);
			expect(tokens[2]).toEqual(mockPunc);
			expect(console.warn).not.toHaveBeenCalled();
			expect(console.error).not.toHaveBeenCalled();
		});

		it('should return an empty array if fetch fails', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network failed'));

			const tokens = await service.getTokens();
			expect(tokens).toEqual([]);
			expect(console.error).toHaveBeenCalled();
			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('No token data found'),
			);
		});

		it('should return an empty array if response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({ok: false, status: 404} as Response);

			const tokens = await service.getTokens();
			expect(tokens).toEqual([]);
			expect(console.error).toHaveBeenCalled();
			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('No token data found'),
			);
		});
	});

	describe('getSentences', () => {
		const mockSentence: ISentence = {
			sentenceId: 's1',
			content: 'Test sentence.',
			translations: {english: {literal: '', contextual: ''}},
			tokenIds: [],
		};
		const mockSentenceData: Record<string, ISentence[]> = {
			'content-key-1': [mockSentence],
		};

		it('should return sentences data on successful fetch', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockSentenceData,
			} as Response);

			const sentences = await service.getSentences();
			expect(mockFetch).toHaveBeenCalledWith(
				`${DatabaseConfig.paths.githubPages}/${DatabaseConfig.files.sentences}`,
			);
			expect(sentences).toEqual(mockSentenceData);
			expect(console.error).not.toHaveBeenCalled();
		});

		it('should return an empty object if fetch fails', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network failed'));

			const sentences = await service.getSentences();
			expect(sentences).toEqual({});
			expect(console.error).toHaveBeenCalled();
		});
	});

	describe('getTextEntries', () => {
		const mockSong: ISong = {
			contentType: ContentType.SONG,
			contentId: 'song1',
			title: 'Test Song',
			content: 'Song lyrics here',
			sentencesIds: [],
			language: {main: 'es'},
			contributors: {main: 'Artist'},
			createdAt: Date.now(),
			updatedAt: Date.now(),
			genre: ['Pop'],
			source: 'Test Source',
		};
		const mockTextEntryData: TextEntriesStorage = {
			[ContentType.SONG]: [mockSong],
		};

		it('should return text entries data on successful fetch', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockTextEntryData,
			} as Response);

			const entries = await service.getTextEntries();
			expect(mockFetch).toHaveBeenCalledWith(
				`${DatabaseConfig.paths.githubPages}/${DatabaseConfig.files.textEntries}`,
			);
			expect(entries).toEqual(mockTextEntryData);
			expect(console.error).not.toHaveBeenCalled();
		});

		it('should return an empty object if fetch fails', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network failed'));

			const entries = await service.getTextEntries();
			expect(entries).toEqual({});
			expect(console.error).toHaveBeenCalled();
		});
	});
});
