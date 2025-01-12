import express from 'express';
import {addNewSong} from './utils/songs/addNewSong';
import {Logger} from './utils/Logger';

const app = express();
const port = 3000;
const logger = new Logger('Server');

app.use(express.json());

app.post('/songs', async (req, res) => {
	logger.start('postSong');
	try {
		const newSong = await addNewSong(req.body);
		logger.info('Song added successfully', {songId: newSong.song.songId});
		res.status(201).json(newSong);
	} catch (error) {
		if (error instanceof Error) {
			logger.error('Failed to add song', error);
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
