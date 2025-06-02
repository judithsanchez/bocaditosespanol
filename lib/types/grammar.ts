import {z} from 'zod';

export enum GrammaticalNumber {
	Singular = 'singular',
	Plural = 'plural',
}

export enum GrammaticalPerson {
	FirstSingular = 'firstSingular',
	SecondSingular = 'secondSingular',
	ThirdSingular = 'thirdSingular',
	FirstPlural = 'firstPlural',
	SecondPlural = 'secondPlural',
	ThirdPlural = 'thirdPlural',
}

export enum GrammaticalGender {
	Masculine = 'masculine',
	Feminine = 'feminine',
	Neutral = 'neutral',
	Common = 'common',
	Ambiguous = 'ambiguous',
}

export const grammaticalNumberSchema = z.nativeEnum(GrammaticalNumber);
export const grammaticalPersonSchema = z.nativeEnum(GrammaticalPerson);
export const grammaticalGenderSchema = z.nativeEnum(GrammaticalGender);

export type IGrammaticalNumber = z.infer<typeof grammaticalNumberSchema>;
export type IGrammaticalPerson = z.infer<typeof grammaticalPersonSchema>;
export type IGrammaticalGender = z.infer<typeof grammaticalGenderSchema>;
