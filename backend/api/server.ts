import express, {Request, Response} from 'express';
import path from 'path';
import cors from 'cors';
import songRoutes from './routes/songs';
import {Logger} from '../src/utils/Logger';
import {NextFunction} from 'express';

interface Error {
	message: string;
}

interface ErrorRequestHandler {
	(err: Error, req: Request, res: Response, next: NextFunction): void;
}

const app = express();
const port = process.env.PORT || 3000;
const logger = new Logger('Server');

app.use(
	cors({
		origin: process.env.ALLOWED_ORIGINS || '*',
		methods: ['GET', 'POST'],
		credentials: true,
	}),
);

app.use(express.json());

app.use('/data', express.static(path.join(process.cwd(), 'public/data')));

app.get('/', (_req, res) => {
	res.send('Hola hola caracolas!');
});

app.use('/songs', songRoutes);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	logger.error('Server error', {error: err.message});
	res.status(500).json({
		error: 'Internal Server Error',
		message: process.env.NODE_ENV === 'development' ? err.message : undefined,
	});
};

app.use(errorHandler);

app.listen(port, () => {
	logger.info('Development server started', {port});
});

export default (req: Request, res: Response) => app(req, res);
