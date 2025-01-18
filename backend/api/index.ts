import type {VercelRequest, VercelResponse} from '@vercel/node';
import app from './server';

const handler = (req: VercelRequest, res: VercelResponse) => {
	return new Promise((resolve, reject) => {
		const expressReq = req as any;
		const expressRes = res as any;
		app(expressReq, expressRes);
		res.on('finish', resolve);
		res.on('error', reject);
	});
};

export default handler;
