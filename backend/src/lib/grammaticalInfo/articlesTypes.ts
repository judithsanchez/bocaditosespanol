import {GrammaticalGender, GrammaticalNumber} from 'lib/types';

export enum ArticleType {
	DEFINITE = 'definite',
	INDEFINITE = 'indefinite',
}

export interface IArticle {
	articleType: ArticleType;
	gender: GrammaticalGender;
	number: GrammaticalNumber;
}
