import {GeminiProvider} from '@/lib/providers/GeminiProvider';
import {
	AIStepType,
	StepConfigs,
	AIProviderType,
	ACTIVE_PROVIDER,
	PROVIDER_BATCH_CONFIGS,
} from '@/lib/config/AIConfig';
import {AIProvider} from '@/lib/types/aiProvider';

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
