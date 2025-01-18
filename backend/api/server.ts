import express, {Request, Response} from 'express';
import cors from 'cors';
import songRoutes from './routes/songs';
import {Logger} from '../src/utils/Logger';

const app = express();
const port = process.env.PORT || 3000;
const logger = new Logger('Server');

app.use(express.json());
app.use(cors());

app.get('/', (_req, res) => {
	res.send('Hola hola caracolas!');
});

app.use('/songs', songRoutes);

if (process.env.NODE_ENV === 'development') {
	app.listen(port, () => {
		logger.info('Development server started', {port});
	});
}

export default (req: Request, res: Response) => app(req, res);
