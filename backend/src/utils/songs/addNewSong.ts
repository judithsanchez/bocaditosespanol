import {errors} from '../../lib/constants';
import {AddSongRequest} from '../../../../lib/types';
import {TextProcessor} from '../../utils/TextProcessor';
import {saveToDatabase} from '../../utils/saveToDatabase';

export async function addNewSong(songData: AddSongRequest) {
	if (
		!songData.interpreter ||
		!songData.title ||
		!songData.youtube ||
		!songData.genre ||
		!songData.language ||
		!songData.releaseDate ||
		!songData.lyrics
	) {
		throw new Error(errors.invalidData);
	}

	try {
		const processor = new TextProcessor(songData);
		await processor.processText();

		// console.log('\n📊 Processing Statistics:');
		// console.log(
		// 	'Original Sentences Count:',
		// 	processor.splittedParagraph.length,
		// );
		// console.log('Original Sentences IDs:', processor.originalSentencesIds);
		// console.log(
		// 	'Deduplicated Sentences Count:',
		// 	processor.deduplicatedSentences.length,
		// );
		// console.log('Original Tokens Count:', processor.originalTokens.length);
		// console.log(
		// 	'Deduplicated Tokens Count:',
		// 	processor.deduplicatedTokens.length,
		// );

		await saveToDatabase({
			song: processor.formattedTextEntry,
			sentences: processor.enrichedSentences,
			tokens: processor.enrichedTokens,
		});

		return {
			song: processor.formattedTextEntry,
			sentences: processor.enrichedSentences,
			tokens: processor.enrichedTokens,
			stats: {
				originalSentencesCount: processor.splittedParagraph.length,
				originalSentencesIds: processor.originalSentencesIds,
				deduplicatedSentencesCount: processor.deduplicatedSentences.length,
				originalTokensCount: processor.originalTokens.length,
				deduplicatedTokensCount: processor.deduplicatedTokens.length,
				enrichenedSentencesCount: processor.enrichedSentences.length,
				enrichenedTokensCount: processor.enrichedTokens.length,
			},
		};
	} catch (error) {
		console.error(`${errors.processingError}: ${error}`);
		throw new Error(`${errors.processingError}: ${error}`);
	}
}
// import {readFile} from 'fs/promises';
// import {errors} from '../../lib/constants';
// import {join} from 'path';
// import {createAndSaveTextFile} from '../../utils/createAndSaveTextFile';
// import {TextProcessor} from '../../utils/TextProcessor';

// export async function addNewSong({
// 	songId,
// 	interpreter,
// 	feat,
// 	songName,
// 	youtube,
// 	genre,
// 	language,
// 	releaseDate,
// 	rawLyrics,
// }: {
// 	songId: string;
// 	interpreter: string;
// 	feat?: string;
// 	songName: string;
// 	youtube: string;
// 	genre: string;
// 	language: string;
// 	releaseDate: string;
// 	rawLyrics: string;
// }) {
// 	if (
// 		!songId ||
// 		!interpreter ||
// 		!songName ||
// 		!youtube ||
// 		!genre ||
// 		!language ||
// 		!releaseDate ||
// 		!rawLyrics
// 	) {
// 		throw new Error(errors.invalidData);
// 	}

// 	const folderPaths = {
// 		proceseed: 'src/data/lyrics/processed',
// 		raw: 'src/data/lyrics/raw',
// 	};

// 	try {
// 		const rawLyricsContent = {
// 			songId,
// 			rawLyricsId: `raw-${songId}`,
// 			lyrics: rawLyrics,
// 		};

// 		await createAndSaveTextFile({
// 			content: rawLyricsContent,
// 			folderPath: folderPaths.raw,
// 			fileName: `${songId}.json`,
// 		});

// 		const processor = new TextProcessor(rawLyrics);
// 		const processedLyrics = await processor.processText();

// 		const processedLyricsContent = {
// 			songId,
// 			processedLyricsId: `processed-${songId}`,
// 			data: processedLyrics,
// 		};

// 		await createAndSaveTextFile({
// 			content: processedLyricsContent,
// 			folderPath: folderPaths.proceseed,
// 			fileName: `${songId}.json`,
// 		});

// 		const newSongEntry = {
// 			songId,
// 			metadata: {
// 				interpreter,
// 				...(feat && {feat}),
// 				songName,
// 				youtube,
// 				genre,
// 				language,
// 				releaseDate,
// 			},
// 			jsonFiles: {
// 				raw: `${folderPaths.raw}/${songId}.json`,
// 				processed: `${folderPaths.proceseed}/${songId}.json`,
// 			},
// 			createdAt: new Date().toISOString(),
// 			updatedAt: new Date().toISOString(),
// 		};

// 		const songsFilePath = join('src', 'data', 'lyrics', 'songs.json');
// 		const existingSongs = JSON.parse(await readFile(songsFilePath, 'utf-8'));

// 		if (
// 			existingSongs.some((song: {songId: string}) => song.songId === songId)
// 		) {
// 			throw new Error(errors.songIdMismatch(songId, 'existing song'));
// 		}

// 		existingSongs.push(newSongEntry);

// 		await createAndSaveTextFile({
// 			content: existingSongs,
// 			folderPath: 'src/data/lyrics',
// 			fileName: 'songs.json',
// 		});

// 		return newSongEntry;
// 	} catch (error) {
// 		console.error(`${errors.processingError}: ${error}`);
// 		throw new Error(`${errors.processingError}: ${error}`);
// 	}
// }
