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
	english?: Promise<string> | string;
	hasSpecialChar: boolean;
	type?: Promise<string> | string; // TODO: figure out how to use WordType here
}

export enum WordType {
	Noun = 'noun',
	Verb = 'verb',
	Conjunction = 'conjunction',
	Preposition = 'preposition',
	Article = 'article',
	Adjective = 'adjective',
	Adverb = 'adverb',
	Pronoun = 'pronoun',
	Interjection = 'interjection',
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
