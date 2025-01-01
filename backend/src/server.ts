import express from 'express';
import {addNewSong} from './utils/songs/addNewSong';

const app = express();
const port = 3000;

app.use(express.json());

app.post('/songs', async (req, res) => {
	try {
		const newSong = await addNewSong(req.body);
		res.status(201).json(newSong);
	} catch (error) {
		if (error instanceof Error) {
			res.status(400).json({error: error.message});
		} else {
			res.status(400).json({error: 'An unknown error occurred'});
		}
	}
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
