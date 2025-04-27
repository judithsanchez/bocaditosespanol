import {
	GrammaticalInfo,
	PartOfSpeech,
	grammaticalInfoSchema,
} from './partsOfSpeech';
import {z} from 'zod';

// Schema for the initial sense before partOfSpeech is determined
export const initialSenseSchema = z.object({
	senseId: z.string(),
	tokenId: z.string(),
	content: z.string().optional(), // Making content optional initially if needed
	hasSpecialChar: z.boolean(),
	translations: z.object({
		english: z.array(z.string()),
	}),
	lastUpdated: z.number(),
});

export type IInitialSense = z.infer<typeof initialSenseSchema>;

// Schema for the fully processed sense
export const senseSchema = initialSenseSchema.extend({
	partOfSpeech: z.nativeEnum(PartOfSpeech),
	grammaticalInfo: grammaticalInfoSchema.optional(),
});

export interface ISense extends IInitialSense {
	senseId: string;
	tokenId: string;
	hasSpecialChar: boolean;
	translations: {english: string[]};
	partOfSpeech: PartOfSpeech;
	grammaticalInfo?: GrammaticalInfo;
}
