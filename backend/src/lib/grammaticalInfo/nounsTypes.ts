import {GrammaticalGender, GrammaticalNumber} from 'lib/types';

export interface INoun {
	gender: GrammaticalGender | '';
	number: GrammaticalNumber | '';
	isProperNoun: boolean;
	diminutive?: boolean;
}
