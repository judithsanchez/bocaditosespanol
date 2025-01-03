import {GrammaticalGender, GrammaticalNumber} from 'lib/types';

export interface IDeterminer {
	type:
		| 'demonstrative'
		| 'possessive'
		| 'indefinite'
		| 'interrogative'
		| 'exclamative'
		| 'relative';
	gender: GrammaticalGender;
	number: GrammaticalNumber;
}
