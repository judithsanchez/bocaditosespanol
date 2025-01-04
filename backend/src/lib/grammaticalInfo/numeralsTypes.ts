import {GrammaticalGender, GrammaticalNumber} from 'lib/types';

export enum NumeralType {
	Cardinal = 'cardinal',
	Ordinal = 'ordinal',
	Multiplicative = 'multiplicative',
	Fractional = 'fractional',
}
export interface INumeral {
	numeralType: NumeralType;
	gender?: GrammaticalGender;
	number?: GrammaticalNumber;
}
