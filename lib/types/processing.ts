// 1. Processing Stages
export enum ProcessingStage {
	RAW = 'raw',
	TOKENIZED = 'tokenized',
	ENRICHED = 'enriched',
	FINALIZED = 'finalized',
	ERROR = 'error', // Added ERROR stage
}

// 2. Processing State Tracking
export interface ProcessingState {
	stage: ProcessingStage;
	startedAt: number;
	completedAt?: number;
	error?: {
		message: string;
		code?: string; // Optional error code (e.g., 'API_FAILURE', 'VALIDATION_ERROR')
		details?: Record<string, any>; // Optional additional details
		// 'stage' and 'timestamp' can be inferred from the main ProcessingState
		// or logged separately if needed, removing them from here simplifies.
	};
}

import {z} from 'zod'; // Add Zod import

// processingStateSchema is defined below the original ProcessingState interface
export const processingStateSchema = z.object({
	stage: z.nativeEnum(ProcessingStage),
	startedAt: z.number(),
	completedAt: z.number().optional(),
	error: z
		.object({
			message: z.string(),
			code: z.string().optional(),
			details: z.record(z.any()).optional(),
		})
		.optional(),
});

// 3. Analysis Results (Placeholder for now, can be expanded later)
export const contentAnalysisSchema = z.object({
	complexity: z
		.object({
			score: z.number(),
			factors: z.array(z.string()),
		})
		.optional(),
	languageVariants: z
		.object({
			detected: z.array(z.string()),
			confidence: z.number(),
		})
		.optional(),
	contentQuality: z
		.object({
			isComplete: z.boolean(),
			hasErrors: z.boolean(),
			suggestions: z.array(z.string()).optional(),
		})
		.optional(),
});

export interface ContentAnalysis
	extends z.infer<typeof contentAnalysisSchema> {}
// This changes ContentAnalysis to be an inferred type from the schema.
// The previous interface definition can be removed or kept as a reference.
// Let's remove the old one to avoid duplication.
/*
export interface ContentAnalysis {
	complexity?: {
		// Made optional for now
		score: number;
		factors: string[];
	};
	languageVariants?: {
		// Made optional for now
		detected: string[];
		confidence: number;
	};
	contentQuality?: {
		// Made optional for now
		isComplete: boolean;
		hasErrors: boolean;
    suggestions?: string[];
  };
}
*/
