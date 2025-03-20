import {GoogleGenerativeAI, Schema} from '@google/generative-ai';
import {AIProvider} from '../types/types';
import {Logger} from '../utils/Logger';
import {HarmBlockThreshold, HarmCategory} from '@google/generative-ai';
import {BatchOptions} from '../config/AIConfig';

export const geminiSafetySettings = [
	{
		category: HarmCategory.HARM_CATEGORY_HARASSMENT,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
	{
		category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
	{
		category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
	{
		category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
];

export class GeminiProvider implements AIProvider {
	private logger = new Logger('GeminiProvider', true);
	private genAI: GoogleGenerativeAI;

	constructor(
		apiKey: string,
		private modelName: string = 'gemini-2.0-flash',
		private temperature: number = 0,
		private topK: number = 10,
		private topP: number = 0.5,
		private batchConfig: BatchOptions,
	) {
		this.genAI = new GoogleGenerativeAI(apiKey);
		this.logger.info('Initialized with model', {
			modelName: this.modelName,
			batchConfig: this.batchConfig,
		});
	}
	async enrichContent(
		input: unknown,
		schema: unknown,
		instruction: string,
		generationParams?: {
			temperature?: number;
			topK?: number;
			topP?: number;
		},
	): Promise<unknown> {
		this.logger.start('enrichContent');

		try {
			this.logger.info('Creating model with parameters', {
				modelName: this.modelName,
				generationParams,
				schemaProvided: !!schema,
			});

			const model = this.genAI.getGenerativeModel({
				model: this.modelName,
				generationConfig: {
					temperature: generationParams?.temperature ?? this.temperature,
					topK: generationParams?.topK ?? this.topK,
					topP: generationParams?.topP ?? this.topP,
					responseMimeType: 'application/json',
					responseSchema: schema as Schema,
				},
				systemInstruction: instruction,
				safetySettings: geminiSafetySettings,
			});

			this.logger.info('Sending prompt to model', {
				inputLength: JSON.stringify(input).length,
				instruction: instruction,
			});

			const prompt = {
				contents: [
					{
						role: 'user',
						parts: [{text: JSON.stringify(input)}],
					},
				],
			};

			const result = await model.generateContent(prompt);
			const response = await result.response.text();
			const parsedResponse = JSON.parse(response);

			this.logger.info('Successfully generated and parsed response', {
				responseLength: response.length,
			});

			this.logger.end('enrichContent');
			return parsedResponse;
		} catch (error) {
			this.logger.error('Failed to enrich content', error);
			throw error;
		}
	}
}
