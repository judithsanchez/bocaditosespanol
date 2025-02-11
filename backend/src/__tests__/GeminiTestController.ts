import {Request, Response} from 'express';
import {GeminiProvider} from '../providers/GeminiProvider';
import {ContentSchemaFactory} from '../factories/ContentSchemaFactory';
import {ContentInstructionFactory} from '../factories/ContentInstructionsFactory';
import {Router} from 'express';

export class GeminiTestController {
	private gemini: GeminiProvider;

	constructor() {
		this.gemini = new GeminiProvider(
			process.env.GEMINI_API_KEY!,
			process.env.GEMINI_MODEL,
		);
	}

	async testEnrich(req: Request, res: Response) {
		try {
			const {input, contentType = 'song', generationParams} = req.body;

			const schema = ContentSchemaFactory.createSchema(contentType);
			const instruction =
				ContentInstructionFactory.createInstruction(contentType);

			const result = await this.gemini.enrichContent(
				input,
				schema,
				instruction,
				generationParams,
			);

			res.json({
				result,
				input,
				instruction,
				schema,
				generationParams,
			});
		} catch (error) {
			res.status(500).json({error: (error as Error).message});
		}
	}
}

const router = Router();
const controller = new GeminiTestController();

router.post('/test-gemini', controller.testEnrich.bind(controller));

export default router;
