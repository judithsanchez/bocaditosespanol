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

	// Helper function to read and parse JSON files
	async function readJsonFile(filename: string) {
		try {
			const content = await readFile(join(dbPath, filename), 'utf-8');
			return JSON.parse(content);
		} catch {
			return [];
		}
	}

	// Helper function to write JSON files
	async function writeJsonFile(filename: string, data: unknown) {
		await writeFile(join(dbPath, filename), JSON.stringify(data, null, 2));
	}

	// Read existing data
	const [existingSongs, existingSentences, existingTokens] = await Promise.all([
		readJsonFile('songs.json'),
		readJsonFile('sentences.json'),
		readJsonFile('tokens.json'),
	]);

	// Enhanced duplicate checking with logging
	const isDuplicateSong = existingSongs.some(
		(s: ISong) => s.songId === song.songId,
	);
	if (isDuplicateSong) {
		console.log('\n🎵 Duplicate Song Detected:');
		console.log(`Song ID: ${song.songId}`);
		console.log(`Title: ${song.metadata.title}`);
		console.log(`Interpreter: ${song.metadata.interpreter}`);
		throw new Error(`Song with ID ${song.songId} already exists`);
	}

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

	if (duplicateSentences.length > 0) {
		console.log('\n📝 Skipping Duplicate Sentences:');
		duplicateSentences.forEach(sentence =>
			console.log(`Sentence ID: ${sentence.sentenceId}`),
		);
	}

	if (duplicateTokens.length > 0) {
		console.log('\n🔤 Skipping Duplicate Tokens:');
		duplicateTokens.forEach(token => console.log(`Token ID: ${token.tokenId}`));
	}

	const newSentences = sentences.filter(
		newSentence => !duplicateSentences.includes(newSentence),
	);

	const newTokens = tokens.filter(
		newToken => !duplicateTokens.includes(newToken),
	);

	await Promise.all([
		writeJsonFile('songs.json', [...existingSongs, song]),
		writeJsonFile('sentences.json', [...existingSentences, ...newSentences]),
		writeJsonFile('tokens.json', [...existingTokens, ...newTokens]),
	]);

	console.log('\n✅ Successfully added:');
	console.log(`New sentences: ${newSentences.length}`);
	console.log(`New tokens: ${newTokens.length}`);

	return {
		addedSong: song,
		addedSentences: newSentences.length,
		addedTokens: newTokens.length,
	};
}
