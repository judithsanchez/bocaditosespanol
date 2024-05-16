export interface ISentence {
	sentence: string;
	tokens: IToken[];
}
export enum TokenType {
	Word = 'word',
	Emoji = 'emoji',
	PunctuationSign = 'punctuationSign',
}

export interface IToken {
	token: string | IWord;
	type: TokenType;
}

export interface IWord {
	spanish: string;
	normalizedToken: string;
	english?: string;
	hasSpecialChar: boolean;
	type?: WordType;
}

export enum WordType {
	Noun = 'noun',
	Verb = 'verb',
	Conjunction = 'conjunction',
	Prepostion = 'preposition',
	Article = 'article',
}

export interface ITextProcessor {
	processedText: ISentence[];
	textData: string;
	processTextData(lyrics: string): ISentence[];
}

export interface IText {}

// export interface ISongData {
// 	title: string;
// 	artist: string;
// 	album?: string;
// 	youtubeVideo?: string;
// 	spotify?: string;
// 	genre: string[];
// 	released: string;
// 	lyrics: string;
// }
