export enum AIProviderType {
	GEMINI = 'GEMINI',
	OLLAMA = 'OLLAMA',
}

export interface AIModelConfig {
	temperature: number;
	topK: number;
	topP: number;
}

export interface ProviderConfig {
	type: AIProviderType;
	modelName: string;
	baseUrl?: string;
}

// TODO: figure out how to make it work with ollama
export const ACTIVE_PROVIDER: ProviderConfig = {
	type: AIProviderType.GEMINI,
	modelName: 'gemini-2.0-flash',
	// Uncomment for Ollama
	// type: AIProviderType.OLLAMA,
	// modelName: 'deepseek-r1',
	// baseUrl: 'http://localhost:11434',
};

export enum AIStepType {
	COGNATE_ANALYSIS = 'COGNATE_ANALYSIS',
	GRAMMATICAL_ENRICHER = 'GRAMMATICAL_ENRICHER',
	SENTENCE_ENRICHER = 'SENTENCE_ENRICHER',
	SENSES_ENRICHMENT = 'SENSES_ENRICHMENT',
	SLANG_DETECTION = 'SLANG_DETECTION',
	LEARNING_INSIGHTS_ENRICHER = 'learning_insights_enricher',
}
export const StepConfigs: Record<AIStepType, AIModelConfig> = {
	[AIStepType.COGNATE_ANALYSIS]: {
		temperature: 0.3,
		topK: 4,
		topP: 0.3,
	},
	[AIStepType.GRAMMATICAL_ENRICHER]: {
		temperature: 0,
		topK: 5,
		topP: 0.5,
	},
	[AIStepType.SENTENCE_ENRICHER]: {
		temperature: 0.7,
		topK: 8,
		topP: 0.7,
	},
	[AIStepType.SENSES_ENRICHMENT]: {
		temperature: 0.5,
		topK: 6,
		topP: 0.5,
	},
	[AIStepType.SLANG_DETECTION]: {
		temperature: 0.8,
		topK: 10,
		topP: 0.8,
	},
	[AIStepType.LEARNING_INSIGHTS_ENRICHER]: {
		temperature: 0.8,
		topK: 50, // TODO: confirm this
		topP: 0.85,
	},
};

export interface BatchOptions {
	retryAttempts: number;
	delayBetweenBatches: number;
	maxRequestsPerMinute: number;
	timeoutMs: number;
	maxConcurrentBatches: number;
}

export const PROVIDER_BATCH_CONFIGS: Record<AIProviderType, BatchOptions> = {
	[AIProviderType.GEMINI]: {
		retryAttempts: 3,
		delayBetweenBatches: 200,
		maxRequestsPerMinute: 60,
		timeoutMs: 30000,
		maxConcurrentBatches: 4,
	},
	[AIProviderType.OLLAMA]: {
		retryAttempts: 3,
		delayBetweenBatches: 1000,
		maxRequestsPerMinute: 10,
		timeoutMs: 120000,
		maxConcurrentBatches: 1,
	},
};
