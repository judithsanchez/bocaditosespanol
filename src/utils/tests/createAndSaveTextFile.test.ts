import {errors, testMessages} from 'lib/constants';
import {createAndSaveTextFile} from '../createAndSaveTextFile';
import {mkdir, writeFile} from 'fs/promises';

jest.mock('fs/promises');
jest.mock('uuid', () => ({
	v4: () => 'mock-uuid-1234',
}));

describe('createAndSaveTextFile', () => {
	const mockData = [
		{sentence: 'Hola mundo', translation: 'Hello world'},
		{sentence: '¿Cómo estás?', translation: 'How are you?'},
	];
	const mockFolderPath = '/mock/path';
	const mockFileName = 'test.json';

	beforeEach(() => {
		jest.clearAllMocks();
		(mkdir as jest.Mock).mockResolvedValue(undefined);
		(writeFile as jest.Mock).mockResolvedValue(undefined);
	});

	test('creates directory and saves file with correct format', async () => {
		const id = await createAndSaveTextFile(
			mockData,
			mockFolderPath,
			mockFileName,
		);

		expect(mkdir).toHaveBeenCalledWith(mockFolderPath, {recursive: true});

		const writeFileCalls = (writeFile as jest.Mock).mock.calls[0];
		expect(writeFileCalls[0]).toMatch(/^\/mock\/path\/test_.*\.json$/);

		const content = JSON.parse(writeFileCalls[1]);
		expect(content).toEqual({
			id: 'mock-uuid-1234',
			data: mockData,
		});

		expect(id).toBe('mock-uuid-1234');
	});

	test('throws error when mkdir fails', async () => {
		const dirError = new Error(testMessages.directoryCreationFailed);
		(mkdir as jest.Mock).mockRejectedValue(dirError);

		await expect(
			createAndSaveTextFile(mockData, mockFolderPath, mockFileName),
		).rejects.toThrowError(`${errors.failedToSaveData} ${dirError}`);
	});

	test('throws error when writeFile fails', async () => {
		const writeError = new Error(testMessages.writeOperationFailed);
		(writeFile as jest.Mock).mockRejectedValue(writeError);

		await expect(
			createAndSaveTextFile(mockData, mockFolderPath, mockFileName),
		).rejects.toThrowError(`${errors.failedToSaveData} ${writeError}`);
	});

	test('handles empty data array', async () => {
		const id = await createAndSaveTextFile([], mockFolderPath, mockFileName);

		const writeFileCalls = (writeFile as jest.Mock).mock.calls[0];
		const content = JSON.parse(writeFileCalls[1]);
		expect(content.data).toEqual([]);
		expect(id).toBe('mock-uuid-1234');
	});
});
