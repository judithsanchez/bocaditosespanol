import {errors, logs} from '../lib/constants';
import {writeFile, mkdir} from 'fs/promises';
import {join} from 'path';

export async function createAndSaveTextFile({
	content,
	folderPath,
	fileName,
}: {
	content: unknown;
	folderPath: string;
	fileName: string;
}): Promise<string> {
	try {
		await mkdir(folderPath, {recursive: true});
		const filePath = join(folderPath, fileName);
		await writeFile(filePath, JSON.stringify(content, null, 2));
		return filePath;
	} catch (error) {
		console.error(`${logs.errorSavingData} ${error}`);
		throw new Error(`${errors.failedToSaveData} ${error}`);
	}
}
