import {errors, logs} from '../lib/constants';
import {writeFile, mkdir} from 'fs/promises';
import {join} from 'path';
import {v4 as uuidv4} from 'uuid';

export async function saveProcessedText<T>(
	data: T[],
	folderPath: string,
	fileName: string,
): Promise<string> {
	try {
		await mkdir(folderPath, {recursive: true});

		const baseFileName = fileName.replace('.json', '');
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const finalFileName = `${baseFileName}_${timestamp}.json`;
		const filePath = join(folderPath, finalFileName);

		const newEntry = {
			id: uuidv4(),
			data,
		};

		await writeFile(filePath, JSON.stringify(newEntry, null, 2));
		console.log(`${logs.dataSaved} ${newEntry.id}`);
		return newEntry.id;
	} catch (error) {
		console.error(`${logs.errorSavingData} ${error}`);
		throw new Error(`${errors.failedToSaveData} ${error}`);
	}
}
