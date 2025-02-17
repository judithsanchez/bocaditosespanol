import {GeminiProvider} from '../providers/GeminiProvider';
import {OllamaProvider} from '../providers/OllamaProvider';
import {AIProvider} from '../lib/types';
import {
	AIStepType,
	StepConfigs,
	AIProviderType,
	ACTIVE_PROVIDER,
	PROVIDER_BATCH_CONFIGS,
} from '../config/AIConfig';

export class AIProviderFactory {
	private static instance: AIProviderFactory;
	private providers: Map<string, AIProvider> = new Map();

	private constructor() {}

	static getInstance(): AIProviderFactory {
		if (!AIProviderFactory.instance) {
			AIProviderFactory.instance = new AIProviderFactory();
		}
		return AIProviderFactory.instance;
	}

	private createProvider(stepType: AIStepType): AIProvider {
		const config = StepConfigs[stepType];
		const batchConfig = PROVIDER_BATCH_CONFIGS[ACTIVE_PROVIDER.type];

		switch (ACTIVE_PROVIDER.type) {
			case AIProviderType.GEMINI:
				return new GeminiProvider(
					process.env.GOOGLE_GENERATIVE_AI_KEY || '',
					ACTIVE_PROVIDER.modelName,
					config.temperature,
					config.topK,
					config.topP,
					batchConfig,
				);

			case AIProviderType.OLLAMA:
				if (!ACTIVE_PROVIDER.baseUrl) {
					throw new Error('Base URL is required for Ollama provider');
				}
				return new OllamaProvider(
					ACTIVE_PROVIDER.baseUrl,
					ACTIVE_PROVIDER.modelName,
					batchConfig,
				);

			default:
				throw new Error(`Unsupported provider type: ${ACTIVE_PROVIDER.type}`);
		}
	}
	getProvider(stepType: AIStepType): AIProvider {
		if (!this.providers.has(stepType)) {
			const provider = this.createProvider(stepType);
			this.providers.set(stepType, provider);
		}

		return this.providers.get(stepType)!;
	}
}
