import {
	GrammaticalGender,
	GrammaticalNumber,
	GrammaticalPerson,
} from 'lib/types';

export enum PronounType {
	Personal = 'personal',
	Demonstrative = 'demonstrative',
	Possessive = 'possessive',
	Relative = 'relative',
	Interrogative = 'interrogative',
	Exclamative = 'exclamative',
	Indefinite = 'indefinite',
	Negative = 'negative',
}

export enum PronounCase {
	Nominative = 'nominative',
	Accusative = 'accusative',
	Dative = 'dative',
	Prepositional = 'prepositional',
}

export interface IPronoun {
	pronounType: PronounType | '';
	person?: GrammaticalPerson | '';
	gender?: GrammaticalGender | '';
	number?: GrammaticalNumber | '';
	case?: PronounCase | '';
	isReflexive?: boolean;
	isReciprocal?: boolean;
}
