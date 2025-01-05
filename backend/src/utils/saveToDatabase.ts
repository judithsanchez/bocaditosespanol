import {readFile, writeFile} from 'fs/promises';
import {join} from 'path';
import {ISentence, ISong} from '../../../lib/types';
import {IEmoji, IPunctuationSign, IWord} from 'lib/types';

export async function saveToDatabase({
	song,
	sentences,
	tokens,
}: {
	song: ISong;
	sentences: ISentence[];
	tokens: Array<IWord | IPunctuationSign | IEmoji>;
}) {
	const dbPath = join(__dirname, '../data');

	console.log('\n📁 Database Operation Started');
	console.log('📊 Input Data Statistics:', {
		song: {
			id: song.songId,
			title: song.metadata.title,
			interpreter: song.metadata.interpreter,
		},
		sentencesCount: sentences.length,
		tokensCount: tokens.length,
	});

	// Helper function to read and parse JSON files
	async function readJsonFile(filename: string) {
		console.log(`📖 Reading ${filename}...`);
		try {
			const content = await readFile(join(dbPath, filename), 'utf-8');
			const data = JSON.parse(content);
			console.log(`✅ Successfully read ${filename}:`, {
				recordCount: Array.isArray(data) ? data.length : 'Not an array',
			});
			return data;
		} catch (error) {
			console.log(`⚠️ File ${filename} not found or empty, creating new array`);
			return [];
		}
	}

	// Helper function to write JSON files
	async function writeJsonFile(filename: string, data: unknown) {
		console.log(`💾 Writing ${filename}...`);
		try {
			await writeFile(join(dbPath, filename), JSON.stringify(data, null, 2));
			console.log(`✅ Successfully wrote ${filename}`);
		} catch (error) {
			console.error(`❌ Error writing ${filename}:`, error);
			throw error;
		}
	}

	try {
		// Read existing data
		const [existingSongs, existingSentences, existingTokens] =
			await Promise.all([
				readJsonFile('songs.json'),
				readJsonFile('sentences.json'),
				readJsonFile('tokens.json'),
			]);

		// Check for duplicates
		const isDuplicateSong = existingSongs.some(
			(s: ISong) => s.songId === song.songId,
		);
		if (isDuplicateSong) {
			console.log('\n🎵 Duplicate Song Detected:', {
				songId: song.songId,
				title: song.metadata.title,
				interpreter: song.metadata.interpreter,
			});
			throw new Error(`Song with ID ${song.songId} already exists`);
		}

		// Log duplicate checks
		const duplicateSentences = sentences.filter(newSentence =>
			existingSentences.some(
				(existingSentence: ISentence) =>
					existingSentence.sentenceId === newSentence.sentenceId,
			),
		);

		const duplicateTokens = tokens.filter(newToken =>
			existingTokens.some(
				(existingToken: IWord | IPunctuationSign | IEmoji) =>
					existingToken.tokenId === newToken.tokenId,
			),
		);

		console.log('\n🔍 Duplicate Analysis:', {
			duplicateSentencesCount: duplicateSentences.length,
			duplicateTokensCount: duplicateTokens.length,
		});

		// Filter out duplicates
		const newSentences = sentences.filter(
			newSentence => !duplicateSentences.includes(newSentence),
		);
		const newTokens = tokens.filter(
			newToken => !duplicateTokens.includes(newToken),
		);

		// Save all data
		await Promise.all([
			writeJsonFile('songs.json', [...existingSongs, song]),
			writeJsonFile('sentences.json', [...existingSentences, ...newSentences]),
			writeJsonFile('tokens.json', [...existingTokens, ...newTokens]),
		]);

		console.log('\n✅ Database Operation Complete:', {
			addedSong: song.songId,
			addedSentences: newSentences.length,
			addedTokens: newTokens.length,
		});

		return {
			addedSong: song,
			addedSentences: newSentences.length,
			addedTokens: newTokens.length,
		};
	} catch (error) {
		console.error('\n❌ Database Operation Failed:', error);
		throw error;
	}
}
