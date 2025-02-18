import {BatchOptions} from 'config/AIConfig';
import {AIProvider} from '../lib/types';
import {Logger} from '../utils/Logger';

interface OllamaGenerationParams {
	temperature?: number;
	topK?: number;
	topP?: number;
}

export class OllamaProvider implements AIProvider {
	private logger = new Logger('OllamaProvider');

	constructor(
		private baseUrl: string,
		private modelName: string,
		private batchConfig: BatchOptions,
	) {
		this.logger.info('Initialized with model', {
			modelName: this.modelName,
			batchConfig: this.batchConfig,
		});
	}

	async enrichContent(
		input: any,
		schema: any,
		instruction: string,
		generationParams?: OllamaGenerationParams,
	): Promise<any> {
		this.logger.start('enrichContent');

		const controller = new AbortController();
		const timeout = setTimeout(() => {
			controller.abort();
		}, this.batchConfig.timeoutMs);

		try {
			const options = {
				temperature: generationParams?.temperature ?? 0,
				top_k: generationParams?.topK ?? 10,
				top_p: generationParams?.topP ?? 0.5,
			};

			this.logger.info('Creating request with parameters', {
				modelName: this.modelName,
				options,
				schemaProvided: !!schema,
			});

			const requestBody = {
				model: this.modelName,
				prompt: `${instruction}\n${JSON.stringify(input)}`,
				options,
				stream: false,
				format: schema ? schema : 'json',
			};

			const response = await fetch(`${this.baseUrl}/api/generate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
				signal: controller.signal,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();

			const parsedResponse =
				typeof result.response === 'string'
					? JSON.parse(result.response)
					: result.response;

			this.logger.info('Successfully generated and parsed response', {
				responseLength: JSON.stringify(parsedResponse).length,
				totalDuration: result.total_duration,
				evalCount: result.eval_count,
			});

			this.logger.end('enrichContent');
			return parsedResponse;
		} catch (error) {
			this.logger.error('Failed to enrich content', error);
			throw error;
		} finally {
			clearTimeout(timeout);
		}
	}
}
