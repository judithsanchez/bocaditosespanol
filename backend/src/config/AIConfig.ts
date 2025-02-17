export interface GeminiConfig {
	modelName: string;
	temperature: number;
	topK: number;
	topP: number;
}

export enum AIStepType {
	COGNATE_ANALYSIS = 'COGNATE_ANALYSIS',
	GRAMMATICAL_ENRICHER = 'GRAMMATICAL_ENRICHER',
	SENTENCE_ENRICHER = 'SENTENCE_ENRICHER',
	SENSES_ENRICHMENT = 'SENSES_ENRICHMENT',
	SLANG_DETECTION = 'SLANG_DETECTION',
}

export const StepConfigs: Record<AIStepType, GeminiConfig> = {
	[AIStepType.COGNATE_ANALYSIS]: {
		modelName: 'gemini-2.0-flash',
		temperature: 0.3,
		topK: 4,
		topP: 0.3,
	},
	[AIStepType.GRAMMATICAL_ENRICHER]: {
		modelName: 'gemini-2.0-flash',
		temperature: 0,
		topK: 5,
		topP: 0.5,
	},
	[AIStepType.SENTENCE_ENRICHER]: {
		modelName: 'gemini-2.0-flash',
		temperature: 0.7,
		topK: 8,
		topP: 0.7,
	},
	[AIStepType.SENSES_ENRICHMENT]: {
		modelName: 'gemini-2.0-flash',
		temperature: 0.5,
		topK: 6,
		topP: 0.5,
	},
	[AIStepType.SLANG_DETECTION]: {
		modelName: 'gemini-2.0-flash',
		temperature: 0.8,
		topK: 10,
		topP: 0.8,
	},
};
