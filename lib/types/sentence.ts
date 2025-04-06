import {z} from 'zod';
import {Token, tokenSchema} from './token';

export interface ISentence {
	sentenceId: string;
	content: string;
	translations: {
		english: {
			literal: string;
			contextual: string;
		};
	};
	tokenIds: string[];
	learningInsights?: ILearningInsight;
	tokens?: Token[];
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
	tokens: z.array(tokenSchema).optional(),
});

export type SentenceType = z.infer<typeof sentenceSchema>;
