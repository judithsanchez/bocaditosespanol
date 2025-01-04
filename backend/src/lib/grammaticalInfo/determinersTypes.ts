import {GrammaticalGender, GrammaticalNumber} from 'lib/types';

export enum DeterminerType {
	Demonstrative = 'demonstrative',
	Possessive = 'possessive',
	Indefinite = 'indefinite',
	Interrogative = 'interrogative',
	Exclamative = 'exclamative',
	Relative = 'relative',
}
export interface IDeterminer {
	determinerType: DeterminerType;
	gender: GrammaticalGender;
	number: GrammaticalNumber;
}
