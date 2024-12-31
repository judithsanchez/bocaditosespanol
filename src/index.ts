import {TextProcessor} from './utils/TextProcessor';
import {errors} from './lib/constants';
import {readFile} from 'fs/promises';
import {join} from 'path';
import {createAndSaveTextFile} from './utils/createAndSaveTextFile';

async function addNewSong({
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
			// data: [rawLyrics]
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

addNewSong({
	songId: 'para-tu-amor-juanes',
	interpreter: 'juanes',
	songName: 'Para Tu Amor',
	youtube: 'https://www.youtube.com/watch?v=yWkQbrfSvfs&ab_channel=JuanesVEVO',
	genre: 'Latin Pop',
	language: 'Spanish',
	releaseDate: '2005',
	rawLyrics:
		'Para tu amor lo tengo todo. Desde mi sangre hasta la esencia de mi ser. Y para tu amor, que es mi tesoro. Tengo mi vida toda entera a tus pies. Y tengo también. Un corazón que se muere por dar amor. Y que no conoce el fin. Un corazón que late por vos. Para tu amor no hay despedidas. Para tu amor yo solo tengo eternidad. Y para tu amor que me ilumina. Tengo una luna, un arcoíris y un clavel. Y tengo también. Un corazón que se muere por dar amor. Y que no conoce el fin. Un corazón que late por vos. Por eso yo te quiero. Tanto que no sé. Como explicar. Lo que siento. Yo te quiero. Porque tu dolor. Es mi dolor. Y no hay dudas. Yo te quiero. Con el alma y con. El corazón. Te venero. Hoy y siempre. Gracias yo te doy. A ti, mi amor. Por existir. Para tu amor lo tengo todo. Lo tengo todo y lo que no tengo también. Lo conseguiré. Para tu amor, que es mi tesoro. Tengo mi vida toda entera a tus pies. Y tengo también. Un corazón que se muere por dar amor. Y que no conoce el fin. Un corazón que late por vos. Por eso yo te quiero. Tanto que no sé. Como explicar. Lo que siento. Yo te quiero. Porque tu dolor. Es mi dolor. Y no hay dudas. Yo te quiero. Con el alma y con. El corazón. Te venero. Hoy y siempre. Gracias yo te doy. A ti, mi amor.',
});
