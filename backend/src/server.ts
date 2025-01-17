import express from 'express';
import {Logger} from './utils/Logger';
import {SongProcessingPipeline} from './pipelines/SongProcessingPipeline';
import {DatabaseService} from './services/DatabaseService';
import cors from 'cors';

const app = express();
const port = 3000;
const logger = new Logger('Server');
const pipeline = new SongProcessingPipeline();

app.use(express.json());
app.use(cors());

app.post('/songs', async (req, res) => {
	logger.start('postSong');
	try {
		const result = await pipeline.processText(req.body);
		logger.info('Song processed successfully', {songId: result.song.songId});
		res.status(201).json(result);
	} catch (error) {
		if (error instanceof Error) {
			logger.error('Failed to process song', error);
			res.status(400).json({error: error.message});
		} else {
			logger.error('Unknown error occurred', error);
			res.status(400).json({error: 'An unknown error occurred'});
		}
	}
	logger.end('postSong');
});

app.get('/songs', async (_req, res) => {
	logger.start('getAllSongs');
	try {
		const dbService = new DatabaseService();
		const textEntries = await dbService.readFile('text-entries.json');
		const songs = textEntries.song || [];

		const simplifiedSongs = songs.map((song: {songId: any; metadata: any}) => ({
			songId: song.songId,
			metadata: song.metadata,
		}));

		logger.info('Retrieved all songs metadata successfully', {
			count: simplifiedSongs.length,
		});
		res.status(200).json(simplifiedSongs);
	} catch (error) {
		if (error instanceof Error) {
			logger.error('Failed to retrieve songs metadata', error);
			res.status(400).json({error: error.message});
		} else {
			logger.error('Unknown error occurred', error);
			res.status(500).json({error: 'An unknown error occurred'});
		}
	}
	logger.end('getAllSongs');
});

app.get('/songs/:songId', async (req, res) => {
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

		const allTokens = await dbService.getTokens();
		const tokenMap = new Map(allTokens.map(token => [token.tokenId, token]));

		const orderedSentences = songEntry.lyrics.map((sentenceId: string) => {
			const sentence = songSentences.find(
				(s: any) => s.sentenceId === sentenceId,
			);
			return {
				content: sentence.content,
				sentenceId: sentence.sentenceId,
				tokenIds: sentence.tokenIds,
				translations: sentence.translations,
				tokens: sentence.tokenIds.map((tokenId: string) =>
					tokenMap.get(tokenId),
				),
			};
		});

		// Create enhanced response object with both metadata and sentences
		const response = {
			metadata: songEntry.metadata,
			sentences: orderedSentences,
		};

		logger.info('Song data retrieved successfully', {songId});
		res.status(200).json(response);
	} catch (error) {
		if (error instanceof Error) {
			logger.error('Failed to retrieve song data', error);
			res.status(400).json({error: error.message});
		} else {
			logger.error('Unknown error occurred', error);
			res.status(500).json({error: 'An unknown error occurred'});
		}
	}
	logger.end('getSong');
});

app.listen(port, () => {
	logger.info('Server started', {port});
});
