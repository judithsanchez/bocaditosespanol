import {Token} from './Token.types';

export interface ISentence {
	sentenceId: string;
	content: string;
	translations: {
		english: {
			literal: string;
			contextual: string;
		};
	};
	tokenIds: string[];
	tokens: Token[];
}
