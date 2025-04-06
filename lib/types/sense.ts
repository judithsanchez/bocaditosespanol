import {
	GrammaticalInfo,
	PartOfSpeech,
	grammaticalInfoSchema,
} from './partsOfSpeech';
import {z} from 'zod';

export interface ISense {
	senseId: string;
	tokenId: string;
	content: string;
	hasSpecialChar: boolean;
	translations: {english: string[]};
	partOfSpeech?: PartOfSpeech;
	grammaticalInfo?: GrammaticalInfo;
	lastUpdated: number;
}
export const senseSchema = z.object({
	senseId: z.string(),
	tokenId: z.string(),
	content: z.string(),
	hasSpecialChar: z.boolean(),
	translations: z.object({
		english: z.array(z.string()),
	}),
	partOfSpeech: z.nativeEnum(PartOfSpeech),
	grammaticalInfo: grammaticalInfoSchema,
	lastUpdated: z.number(),
});
