import {writeFile, mkdir} from 'fs/promises';
import {join} from 'path';
import {v4 as uuidv4} from 'uuid';

export async function saveProcessedText<T>(
	data: T[],
	folderPath: string,
	fileName: string,
): Promise<string> {
	await mkdir(folderPath, {recursive: true});

	const baseFileName = fileName.replace('.json', '');
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const finalFileName = `${baseFileName}_${timestamp}.json`;
	const filePath = join(folderPath, finalFileName);

	const newEntry = {
		id: uuidv4(),
		data,
	};

	try {
		await writeFile(filePath, JSON.stringify(newEntry, null, 2));
		console.log(`✅ Data saved with ID: ${newEntry.id}`);
		return newEntry.id;
	} catch (error) {
		console.error('❌ Error saving data:', error);
		throw new Error(`Failed to save data: ${error}`);
	}
}
