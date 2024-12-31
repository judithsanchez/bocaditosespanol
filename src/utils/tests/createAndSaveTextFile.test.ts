import {errors, testMessages} from 'lib/constants';
import {createAndSaveTextFile} from '../createAndSaveTextFile';
import {mkdir, writeFile} from 'fs/promises';
import {join} from 'path';

jest.mock('fs/promises');

describe('createAndSaveTextFile', () => {
	const mockContent = {
		data: [
			{sentence: 'Hola mundo', translation: 'Hello world'},
			{sentence: '¿Cómo estás?', translation: 'How are you?'},
		],
	};
	const mockFolderPath = '/mock/path';
	const mockFileName = 'test.json';

	beforeEach(() => {
		jest.clearAllMocks();
		(mkdir as jest.Mock).mockResolvedValue(undefined);
		(writeFile as jest.Mock).mockResolvedValue(undefined);
	});

	test('creates directory and saves file with correct format', async () => {
		const expectedFilePath = join(mockFolderPath, mockFileName);
		const filePath = await createAndSaveTextFile({
			content: mockContent,
			folderPath: mockFolderPath,
			fileName: mockFileName,
		});

		expect(mkdir).toHaveBeenCalledWith(mockFolderPath, {recursive: true});
		expect(writeFile).toHaveBeenCalledWith(
			expectedFilePath,
			JSON.stringify(mockContent, null, 2),
		);
		expect(filePath).toBe(expectedFilePath);
	});

	test('throws error when mkdir fails', async () => {
		const dirError = new Error(testMessages.directoryCreationFailed);
		(mkdir as jest.Mock).mockRejectedValue(dirError);

		await expect(
			createAndSaveTextFile({
				content: mockContent,
				folderPath: mockFolderPath,
				fileName: mockFileName,
			}),
		).rejects.toThrowError(`${errors.failedToSaveData} ${dirError}`);
	});

	test('throws error when writeFile fails', async () => {
		const writeError = new Error(testMessages.writeOperationFailed);
		(writeFile as jest.Mock).mockRejectedValue(writeError);

		await expect(
			createAndSaveTextFile({
				content: mockContent,
				folderPath: mockFolderPath,
				fileName: mockFileName,
			}),
		).rejects.toThrowError(`${errors.failedToSaveData} ${writeError}`);
	});

	test('handles empty content object', async () => {
		const emptyContent = {};
		const expectedFilePath = join(mockFolderPath, mockFileName);

		const filePath = await createAndSaveTextFile({
			content: emptyContent,
			folderPath: mockFolderPath,
			fileName: mockFileName,
		});

		expect(writeFile).toHaveBeenCalledWith(
			expectedFilePath,
			JSON.stringify(emptyContent, null, 2),
		);
		expect(filePath).toBe(expectedFilePath);
	});
});
