import {GrammaticalGender, GrammaticalNumber} from 'lib/types';

export interface IArticle {
	type: 'definite' | 'indefinite';
	gender: GrammaticalGender;
	number: GrammaticalNumber;
}
