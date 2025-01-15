import express from 'express';
import {Logger} from './utils/Logger';
import {SongProcessingPipeline} from './pipelines/SongProcessingPipeline';

const app = express();
const port = 3000;
const logger = new Logger('Server');
const pipeline = new SongProcessingPipeline();

app.use(express.json());

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

app.listen(port, () => {
	logger.info('Server started', {port});
});
