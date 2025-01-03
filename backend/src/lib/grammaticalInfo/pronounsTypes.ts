import {
	GrammaticalGender,
	GrammaticalNumber,
	GrammaticalPerson,
} from 'lib/types';

export interface IPronoun {
	type:
		| 'personal'
		| 'demonstrative'
		| 'possessive'
		| 'relative'
		| 'interrogative'
		| 'exclamative'
		| 'indefinite'
		| 'negative';
	person?: GrammaticalPerson;
	gender?: GrammaticalGender;
	number?: GrammaticalNumber;
	case?: 'nominative' | 'accusative' | 'dative' | 'prepositional';
	isReflexive?: boolean;
	isReciprocal?: boolean;
}
