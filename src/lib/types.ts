export interface ISentence {
	sentence: string;
	translation: string;
	tokens: IToken[];
}

export type TokenType = 'word' | 'emoji' | 'punctuationSign';

export interface IToken {
	token: string | IWord;
	type: TokenType;
}

export interface IWord {
	spanish: string;
	normalizedToken: string;
	english?: Promise<string> | string;
	hasSpecialChar: boolean;
	wordtType?: Promise<string> | string;
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
	processTextData(text: string): void;
}

export interface IText {}

export interface BatchProcessorConfig<T> {
	items: T[];
	processingFn: (items: T[]) => Promise<T[]>;
	batchSize: number;
	options: {
		retryAttempts: number;
		delayBetweenBatches: number;
		maxRequestsPerMinute: number;
	};
}

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
