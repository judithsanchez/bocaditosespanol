import {GoogleGenerativeAI} from '@google/generative-ai';
import {geminiSafetySettings} from '../lib/constants';
import {Logger} from './Logger';

interface EnricherConfig {
	input: any;
	schema: any;
	instruction: string;
	modelName?: string;
}

export async function genericEnricher({
	input,
	schema,
	instruction,
	modelName = 'gemini-1.5-flash-8b',
}: EnricherConfig) {
	const logger = new Logger('GenericEnricher');
	const genAI = new GoogleGenerativeAI(
		process.env.GOOGLE_GENERATIVE_AI_KEY || '',
	);

	logger.start('enrichContent');
	logger.info('Starting enrichment process', {
		inputType: typeof input,
		modelName,
	});

	const model = genAI.getGenerativeModel({
		model: modelName,
		generationConfig: {
			responseMimeType: 'application/json',
			responseSchema: schema,
		},
		systemInstruction: instruction,
		safetySettings: geminiSafetySettings,
	});

	try {
		const prompt = {
			contents: [
				{
					role: 'user',
					parts: [{text: JSON.stringify(input)}],
				},
			],
		};

		logger.info('Sending request to AI model');
		const result = await model.generateContent(prompt);
		const response = await result.response.text();

		const enrichedContent = JSON.parse(response);
		logger.info('Content enriched successfully');

		logger.end('enrichContent');
		return enrichedContent;
	} catch (error) {
		logger.error('Enrichment failed', error);
		throw error;
	}
}
