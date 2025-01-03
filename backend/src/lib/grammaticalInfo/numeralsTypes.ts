import {GrammaticalGender, GrammaticalNumber} from 'lib/types';

export interface INumeral {
	type: 'cardinal' | 'ordinal' | 'multiplicative' | 'fractional';
	gender?: GrammaticalGender;
	number?: GrammaticalNumber;
}
