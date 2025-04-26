import {WriteDatabaseService} from '../WriteDatabaseService';
import {ReadDatabaseService} from '../ReadDatabaseService';
import {ContentType, ISong} from '@/lib/types/content';
import {ISentence} from '@/lib/types/sentence';
import {IWord, TokenType} from '@/lib/types/token';
import * as fsPromises from 'fs/promises';
import * as fs from 'fs';
import {join} from 'path';

jest.mock('fs/promises');
jest.mock('fs');
jest.mock('../ReadDatabaseService');

const mockWriteFile = fsPromises.writeFile as jest.Mock;
const mockMkdir = fsPromises.mkdir as jest.Mock;
const mockExistsSync = fs.existsSync as jest.Mock;
const MockReadDatabaseService = ReadDatabaseService as jest.MockedClass<
	typeof ReadDatabaseService
>;

const MOCK_DATA_PATH = '/home/judithsanchez/dev/bocaditosespanol/docs/data';

describe('WriteDatabaseService', () => {
	let writeService: WriteDatabaseService;
	let mockReadServiceInstance: jest.Mocked<ReadDatabaseService>;

	beforeEach(() => {
		jest.clearAllMocks();

		mockReadServiceInstance =
			new MockReadDatabaseService() as jest.Mocked<ReadDatabaseService>;
		MockReadDatabaseService.mockImplementation(() => mockReadServiceInstance);

		mockExistsSync.mockReturnValue(true);

		writeService = new WriteDatabaseService();
	});

	it('should initialize ReadDatabaseService and check/create data directory on construction', async () => {
		mockExistsSync.mockReturnValue(false);
		jest.clearAllMocks();

		new WriteDatabaseService();

		expect(MockReadDatabaseService).toHaveBeenCalledTimes(1);
		expect(mockExistsSync).toHaveBeenCalledWith(MOCK_DATA_PATH);
		expect(mockMkdir).toHaveBeenCalledWith(MOCK_DATA_PATH, {recursive: true});
	});

	it('should save a text entry', async () => {
		const now = Date.now();
		const mockEntry: ISong = {
			contentId: 'song-1',
			title: 'Test Song',
			content: 'la la la',
			contentType: ContentType.SONG,
			source: 'http://example.com',
			sentencesIds: ['s1'],
			language: {main: 'es'},
			contributors: {main: 'Test Artist'},
			createdAt: now,
			updatedAt: now,
			genre: ['pop'],
		};
		const mockExistingEntries = {[ContentType.SONG]: []};
		mockReadServiceInstance.getTextEntries.mockResolvedValue(
			mockExistingEntries,
		);

		await writeService.saveTextEntry(mockEntry, ContentType.SONG);

		expect(mockReadServiceInstance.getTextEntries).toHaveBeenCalledTimes(1);
		const expectedFilePath = join(MOCK_DATA_PATH, 'text-entries.json');
		const expectedData = JSON.stringify(
			{[ContentType.SONG]: [mockEntry]},
			null,
			2,
		);
		expect(mockWriteFile).toHaveBeenCalledWith(expectedFilePath, expectedData);
	});

	it('should save sentences', async () => {
		const mockSentences: ISentence[] = [
			{
				sentenceId: 's1',
				content: 'Hello world.',
				translations: {
					english: {literal: 'Hello world.', contextual: 'Hello world.'},
				},
				tokenIds: ['word-hello', 'word-world', 'punct-.'],
			},
		];
		const mockMetadata = {title: 'Test Title', author: 'Test Author'};
		const mockExistingSentences = {};
		mockReadServiceInstance.getSentences.mockResolvedValue(
			mockExistingSentences,
		);

		await writeService.saveSentences(mockSentences, mockMetadata);

		expect(mockReadServiceInstance.getSentences).toHaveBeenCalledTimes(1);
		const expectedFilePath = join(MOCK_DATA_PATH, 'sentences.json');
		const expectedContentKey = 'test-title-test-author';
		const expectedData = JSON.stringify(
			{[expectedContentKey]: mockSentences},
			null,
			2,
		);
		expect(mockWriteFile).toHaveBeenCalledWith(expectedFilePath, expectedData);
	});

	it('should filter existing tokens', async () => {
		const now = Date.now();
		const existingToken: IWord = {
			tokenId: 'word-hola',
			tokenType: TokenType.Word,
			content: 'hola',
			normalizedToken: 'hola',
			isSlang: false,
			isCognate: false,
			isFalseCognate: false,
			lastUpdated: now,
			senses: [],
		};
		const newToken: IWord = {
			tokenId: 'word-mundo',
			tokenType: TokenType.Word,
			content: 'mundo',
			normalizedToken: 'mundo',
			isSlang: false,
			isCognate: false,
			isFalseCognate: false,
			lastUpdated: now,
			senses: [],
		};
		const inputTokens = [existingToken, newToken];
		mockReadServiceInstance.getTokens.mockResolvedValue([existingToken]);

		const result = await writeService.filterExistingTokens(inputTokens);

		expect(mockReadServiceInstance.getTokens).toHaveBeenCalledTimes(1);
		expect(result.existingTokens).toEqual([existingToken]);
		expect(result.newTokens).toEqual([newToken]);
	});

	it('should save tokens', async () => {
		const now = Date.now();
		const mockTokens: IWord[] = [
			{
				tokenId: 'word-test',
				tokenType: TokenType.Word,
				content: 'test',
				normalizedToken: 'test',
				isSlang: false,
				isCognate: false,
				isFalseCognate: false,
				lastUpdated: now,
				senses: [],
			},
		];
		const mockCurrentTokens = {words: {}, punctuationSigns: {}, emojis: {}};
		mockReadServiceInstance.readFile.mockResolvedValue(mockCurrentTokens);

		await writeService.saveTokens(mockTokens);

		expect(mockReadServiceInstance.readFile).toHaveBeenCalledWith(
			'tokens.json',
		);
		const expectedFilePath = join(MOCK_DATA_PATH, 'tokens.json');
		const expectedData = JSON.stringify(
			{
				words: {'word-test': mockTokens[0]},
				punctuationSigns: {},
				emojis: {},
			},
			null,
			2,
		);
		expect(mockWriteFile).toHaveBeenCalledWith(expectedFilePath, expectedData);
	});
});
