import {readFile, writeFile} from 'fs/promises';
import {join} from 'path';
import {ISentence, ISong} from '../../../lib/types';
import {IEmoji, IPunctuationSign, IWord} from 'lib/types';
import {Logger} from './Logger';

const logger = new Logger('DatabaseOperations');

export async function saveToDatabase({
	song,
	sentences,
	tokens,
}: {
	song: ISong;
	sentences: ISentence[];
	tokens: Array<IWord | IPunctuationSign | IEmoji>;
}) {
	logger.start('saveToDatabase');
	const dbPath = join(__dirname, '../data');

	logger.info('Starting database operation', {
		song: {
			id: song.songId,
			title: song.metadata.title,
			interpreter: song.metadata.interpreter,
		},
		sentencesCount: sentences.length,
		tokensCount: tokens.length,
	});

	async function readJsonFile(filename: string) {
		logger.info('Reading file', {filename});
		try {
			const content = await readFile(join(dbPath, filename), 'utf-8');
			const data = JSON.parse(content);
			logger.info('File read successfully', {
				filename,
				recordCount: Array.isArray(data) ? data.length : 'Not an array',
			});
			return data;
		} catch (error) {
			logger.info('File not found or empty, creating new array', {filename});
			return [];
		}
	}

	async function writeJsonFile(filename: string, data: unknown) {
		logger.info('Writing file', {filename});
		try {
			await writeFile(join(dbPath, filename), JSON.stringify(data, null, 2));
			logger.info('File written successfully', {filename});
		} catch (error) {
			logger.error(`Failed to write file: ${filename}`, error);
			throw error;
		}
	}

	try {
		const [existingSongs, existingSentences, existingTokens] =
			await Promise.all([
				readJsonFile('songs.json'),
				readJsonFile('sentences.json'),
				readJsonFile('tokens.json'),
			]);

		const isDuplicateSong = existingSongs.some(
			(s: ISong) => s.songId === song.songId,
		);
		if (isDuplicateSong) {
			logger.error(
				'Duplicate song detected',
				new Error(`Song with ID ${song.songId} already exists`),
			);
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

		logger.info('Duplicate analysis completed', {
			duplicateSentencesCount: duplicateSentences.length,
			duplicateTokensCount: duplicateTokens.length,
		});

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

		logger.info('Database operation completed', {
			addedSong: song.songId,
			addedSentences: newSentences.length,
			addedTokens: newTokens.length,
		});

		logger.end('saveToDatabase');
		return {
			addedSong: song,
			addedSentences: newSentences.length,
			addedTokens: newTokens.length,
		};
	} catch (error) {
		logger.error('Database operation failed', error);
		throw error;
	}
}
