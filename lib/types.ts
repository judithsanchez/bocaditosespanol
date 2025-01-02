import {IWord, TokenType} from 'lib/types';

export interface ISong {
	songId: string;
	metadata: {
		interpreter: string;
		feat?: string;
		songName: string;
		youtube: string;
		genre: string;
		language: string;
		releaseDate: string;
	};
	jsonFiles: {
		raw: string;
		processed: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface ISentence {
	sentence: string;
	translation: string;
	tokens: IToken[];
}

export interface IToken {
	token: string | IWord;
	type: TokenType;
}
