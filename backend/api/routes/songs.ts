import express from 'express';
import dotenv from 'dotenv';
import {SongProcessingPipeline} from '../../src/pipelines/SongProcessingPipeline';
import {Logger} from '../../src/utils/Logger';
import {DatabaseService} from '../../src/services/DatabaseService';
import {songRequestSchema, sentenceSchema} from '@bocaditosespanol/shared';
import {z} from 'zod';

dotenv.config();

const router = express.Router();
const logger = new Logger('Songs');

const getSongResponseSchema = z.object({
	metadata: z.object({
		interpreter: z.string(),
		feat: z.array(z.string()).optional(),
		title: z.string(),
		youtube: z.string().url(),
		genre: z.array(z.string()),
		language: z.string(),
		releaseDate: z.string(),
	}),
	sentences: z.array(sentenceSchema),
});

const getAllSongsResponseSchema = z.array(
	z.object({
		songId: z.string(),
		metadata: z.object({
			interpreter: z.string(),
			feat: z.array(z.string()).optional(),
			title: z.string(),
			youtube: z.string().url(),
			genre: z.array(z.string()),
			language: z.string(),
			releaseDate: z.string(),
		}),
	}),
);

router.get('/', async (_req, res) => {
	logger.start('getAllSongs');
	try {
		const dbService = new DatabaseService();
		const textEntries = await dbService.readFile('text-entries.json');
		const songs = textEntries.song || [];

		const simplifiedSongs = songs.map((song: {songId: any; metadata: any}) => ({
			songId: song.songId,
			metadata: song.metadata,
		}));

		// Validate response
		const validatedResponse = getAllSongsResponseSchema.parse(simplifiedSongs);

		logger.info('Retrieved all songs metadata successfully', {
			count: validatedResponse.length,
		});
		res.status(200).json(validatedResponse);
	} catch (error) {
		if (error instanceof z.ZodError) {
			logger.error('Response validation failed', error);
			res.status(500).json({error: 'Invalid data structure'});
		} else if (error instanceof Error) {
			logger.error('Failed to retrieve songs metadata', error);
			res.status(400).json({error: error.message});
		} else {
			logger.error('Unknown error occurred', error);
			res.status(500).json({error: 'An unknown error occurred'});
		}
	}
	logger.end('getAllSongs');
});

router.get('/:songId', async (req, res) => {
	logger.start('getSong');
	try {
		const songId = req.params.songId;
		const dbService = new DatabaseService();

		const textEntries = await dbService.readFile('text-entries.json');
		const songEntry = textEntries.song.find(
			(entry: any) => entry.songId === songId,
		);

		if (!songEntry) {
			res.status(404).json({error: 'Song not found'});
			return;
		}

		const allSentences = await dbService.readFile('sentences.json');
		const songSentences = allSentences[songId];

		if (!songSentences) {
			logger.error(`No sentences found for song ID: ${songId}`, {songId});
			res.status(404).json({error: 'Song sentences not found'});
			return;
		}

		const allTokens = await dbService.getTokens();
		const tokenMap = new Map(allTokens.map(token => [token.tokenId, token]));

		const orderedSentences = songEntry.lyrics
			.map((sentenceId: string) => {
				const sentence = songSentences.find(
					(s: any) => s.sentenceId.toLowerCase() === sentenceId.toLowerCase(),
				);

				if (!sentence) {
					logger.error(`Sentence not found for ID: ${sentenceId}`, {
						sentenceId,
					});
					return null;
				}

				return {
					content: sentence.content,
					sentenceId: sentence.sentenceId,
					tokenIds: sentence.tokenIds,
					translations: sentence.translations,
					tokens: sentence.tokenIds.map((tokenId: string) =>
						tokenMap.get(tokenId),
					),
					...(sentence.learningInsights &&
						Object.keys(sentence.learningInsights).length > 0 && {
							learningInsights: sentence.learningInsights,
						}),
				};
			})
			.filter(Boolean);

		if (orderedSentences.length === 0) {
			logger.error('No valid sentences found after processing', {songId});
			res.status(404).json({error: 'No valid sentences found'});
			return;
		}

		const response = {
			metadata: songEntry.metadata,
			sentences: orderedSentences,
		};

		const validatedResponse = getSongResponseSchema.parse(response);

		logger.info('Song data retrieved successfully', {songId});
		res.status(200).json(validatedResponse);
	} catch (error) {
		if (error instanceof z.ZodError) {
			logger.error('Response validation failed', error);
			res.status(500).json({error: 'Invalid data structure'});
		} else if (error instanceof Error) {
			logger.error('Failed to retrieve song data', error);
			res.status(400).json({error: error.message});
		} else {
			logger.error('Unknown error occurred', error);
			res.status(500).json({error: 'An unknown error occurred'});
		}
	}
	logger.end('getSong');
});

router.post('/', async (req, res) => {
	logger.start('postSong');
	try {
		// Validate request body
		const validatedBody = songRequestSchema.parse(req.body);

		const pipeline = new SongProcessingPipeline();
		const result = await pipeline.processText(validatedBody);
		logger.info('Song processed successfully', {songId: result.song.songId});
		res.status(201).json(result);
	} catch (error) {
		if (error instanceof z.ZodError) {
			logger.error('Request validation failed', error);
			res.status(400).json({error: 'Invalid request format'});
		} else if (error instanceof Error) {
			logger.error('Failed to process song', error);
			res.status(400).json({error: error.message});
		} else {
			logger.error('Unknown error occurred', error);
			res.status(400).json({error: 'An unknown error occurred'});
		}
	}
	logger.end('postSong');
});

export default router;
