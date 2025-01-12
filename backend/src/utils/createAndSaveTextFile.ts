import {errors} from '../lib/constants';
import {writeFile, mkdir, readFile} from 'fs/promises';
import {join} from 'path';
import {existsSync} from 'fs';
import {Logger} from './Logger';

const logger = new Logger('FileOperations');

export async function createAndSaveTextFile({
	content,
	folderPath,
	fileName,
}: {
	content: unknown;
	folderPath: string;
	fileName: string;
}): Promise<string> {
	logger.start('createAndSaveTextFile');

	try {
		logger.info('Creating directory', {folderPath});
		await mkdir(folderPath, {recursive: true});
		const filePath = join(folderPath, fileName);

		let existingContent = {};
		if (existsSync(filePath)) {
			logger.info('Reading existing file', {filePath});
			const fileContent = await readFile(filePath, 'utf-8');
			existingContent = JSON.parse(fileContent);
		}

		const mergedContent = mergeContent(existingContent, content);

		logger.info('Writing merged content to file', {filePath});
		await writeFile(filePath, JSON.stringify(mergedContent, null, 2));

		logger.info('File operation completed successfully', {filePath});
		logger.end('createAndSaveTextFile');
		return filePath;
	} catch (error) {
		logger.error('Failed to save data', error);
		throw new Error(`${errors.failedToSaveData} ${error}`);
	}
}

function mergeContent(existing: any, newContent: any): any {
	if (Array.isArray(existing) && Array.isArray(newContent)) {
		return [...existing, ...newContent];
	}
	return {...existing, ...newContent};
}
