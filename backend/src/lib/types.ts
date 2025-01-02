import {ISentence} from '../../../lib/types';

export type TokenType = 'word' | 'emoji' | 'punctuationSign';

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
