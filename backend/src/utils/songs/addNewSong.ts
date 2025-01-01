import {readFile} from 'fs/promises';
import {errors} from '../../lib/constants';
import {join} from 'path';
import {createAndSaveTextFile} from '../../utils/createAndSaveTextFile';
import {TextProcessor} from '../../utils/TextProcessor';
// TODO: install nodemon
export async function addNewSong({
	songId,
	interpreter,
	feat,
	songName,
	youtube,
	genre,
	language,
	releaseDate,
	rawLyrics,
}: {
	songId: string;
	interpreter: string;
	feat?: string;
	songName: string;
	youtube: string;
	genre: string;
	language: string;
	releaseDate: string;
	rawLyrics: string;
}) {
	if (
		!songId ||
		!interpreter ||
		!songName ||
		!youtube ||
		!genre ||
		!language ||
		!releaseDate ||
		!rawLyrics
	) {
		throw new Error(errors.invalidData);
	}

	const folderPaths = {
		proceseed: 'src/data/lyrics/processed',
		raw: 'src/data/lyrics/raw',
	};

	try {
		const rawLyricsContent = {
			songId,
			rawLyricsId: `raw-${songId}`,
			lyrics: rawLyrics,
		};

		await createAndSaveTextFile({
			content: rawLyricsContent,
			folderPath: folderPaths.raw,
			fileName: `${songId}.json`,
		});

		const processor = new TextProcessor(rawLyrics);
		const processedLyrics = await processor.processTextData();

		const processedLyricsContent = {
			songId,
			processedLyricsId: `processed-${songId}`,
			data: processedLyrics,
		};

		await createAndSaveTextFile({
			content: processedLyricsContent,
			folderPath: folderPaths.proceseed,
			fileName: `${songId}.json`,
		});

		const newSongEntry = {
			songId,
			metadata: {
				interpreter,
				...(feat && {feat}),
				songName,
				youtube,
				genre,
				language,
				releaseDate,
			},
			jsonFiles: {
				raw: `${folderPaths.raw}/${songId}.json`,
				processed: `${folderPaths.proceseed}/${songId}.json`,
			},
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const songsFilePath = join('src', 'data', 'lyrics', 'songs.json');
		const existingSongs = JSON.parse(await readFile(songsFilePath, 'utf-8'));

		if (
			existingSongs.some((song: {songId: string}) => song.songId === songId)
		) {
			throw new Error(errors.songIdMismatch(songId, 'existing song'));
		}

		existingSongs.push(newSongEntry);

		await createAndSaveTextFile({
			content: existingSongs,
			folderPath: 'src/data/lyrics',
			fileName: 'songs.json',
		});

		return newSongEntry;
	} catch (error) {
		console.error(`${errors.processingError}: ${error}`);
		throw new Error(`${errors.processingError}: ${error}`);
	}
}
