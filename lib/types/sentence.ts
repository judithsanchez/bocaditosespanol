import {z} from 'zod';
import {Token, tokenSchema} from './token';
import {
	ProcessingState,
	processingStateSchema,
	ContentAnalysis,
	contentAnalysisSchema,
} from './processing';

export interface ISentence {
	sentenceId: string;
	content: string; // This was 'originalSentence' in my plan, but 'content' is in the file. Keeping 'content'.
	// contentId: string; // This was in my plan, but not in the file. Omitting for now.
	translations: {
		english: {
			literal: string;
			contextual: string;
		};
	};
	tokenIds: string[];
	learningInsights?: ILearningInsight;
	processedTokens?: Token[];
	processingState: ProcessingState; // Added
	analysisResults?: ContentAnalysis; // Added
}

export interface ILearningInsight {
	difficulty?: Difficulty;
	insight?: string;
}

export enum Difficulty {
	BEGINNER = 'beginner',
	INTERMEDIATE = 'intermediate',
	ADVANCED = 'advanced',
	EXPERT = 'expert',
	MASTER = 'master',
}
export const learningInsightSchema = z.object({
	difficulty: z.nativeEnum(Difficulty).optional(),
	insight: z.string().optional(),
});

export const sentenceSchema = z.object({
	sentenceId: z.string(),
	content: z.string(),
	translations: z.object({
		english: z.object({
			literal: z.string(),
			contextual: z.string(),
		}),
	}),
	tokenIds: z.array(z.string()),
	learningInsights: learningInsightSchema.optional(),
	processedTokens: z.array(tokenSchema).optional(),
	processingState: processingStateSchema, // Added
	analysisResults: contentAnalysisSchema.optional(), // Added
});

export type SentenceType = z.infer<typeof sentenceSchema>;
