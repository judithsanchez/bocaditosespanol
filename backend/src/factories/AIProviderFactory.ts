import {GeminiProvider} from '../providers/GeminiProvider';
import {AIStepType, StepConfigs} from '../config/AIConfig';

export class AIProviderFactory {
	private static instance: AIProviderFactory;
	private providers: Map<string, GeminiProvider> = new Map();

	private constructor() {}

	static getInstance(): AIProviderFactory {
		if (!AIProviderFactory.instance) {
			AIProviderFactory.instance = new AIProviderFactory();
		}
		return AIProviderFactory.instance;
	}

	getProvider(stepType: AIStepType): GeminiProvider {
		if (!this.providers.has(stepType)) {
			const config = StepConfigs[stepType];
			if (!config) {
				throw new Error(`No configuration found for step: ${stepType}`);
			}

			const provider = new GeminiProvider(
				process.env.GOOGLE_GENERATIVE_AI_KEY || '',
				config.modelName,
				config.temperature,
				config.topK,
				config.topP,
			);

			this.providers.set(stepType, provider);
		}

		return this.providers.get(stepType)!;
	}
}
