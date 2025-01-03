import {GrammaticalGender, GrammaticalNumber} from 'lib/types';

export interface IAdjective {
	gender: GrammaticalGender;
	number: GrammaticalNumber;
	isPastParticiple?: boolean;
}
