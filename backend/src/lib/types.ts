import {
	IEmoji,
	IPunctuationSign,
	ISentence,
	ISong,
	IWord,
} from '@bocaditosespanol/shared';

export interface AddSongRequest {
	interpreter: string;
	feat?: string[];
	title: string;
	youtube: string;
	genre: string[];
	language: string;
	releaseDate: string;
	lyrics: string;
}

export interface ITextProcessor {
	splittedParagraph: string[];
	formattedSentences: ISentence[];
	originalSentencesIds: string[];
	formattedTextEntry: ISong;
	tokenizedSentences: ISentence[];
	deduplicatedSentences: ISentence[];
	originalTokens: Array<IWord | IPunctuationSign | IEmoji>;
	deduplicatedTokens: Array<IWord | IPunctuationSign | IEmoji>;
	enrichedTokens: Array<IWord | IPunctuationSign | IEmoji>;

	splitParagraph(string: string): string[];
	formatSentences(params: {
		sentences: string[];
		author: string;
		title: string;
	}): ISentence[];
	formatTextEntry(
		requestBody: AddSongRequest,
		originalSentencesIds: string[],
	): ISong;
	tokenizeSentences(sentences: ISentence[]): ISentence[];
	deduplicateSentences(sentences: ISentence[]): ISentence[];
	deduplicateTokens(
		tokens: Array<IWord | IPunctuationSign | IEmoji>,
	): Promise<Array<IWord | IPunctuationSign | IEmoji>>;
	enrichTokens(
		tokens: Array<IWord | IPunctuationSign | IEmoji>,
	): Promise<Array<IWord | IPunctuationSign | IEmoji>>;

	processText(): Promise<void>;
}

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

export interface IStoredWord {
	tokenId: string;
	tokenType: string;
	content: string;
	normalizedToken: string;
	translations: {
		english: string[];
	};
	hasSpecialChar: boolean;
	partOfSpeech: string;
	isSlang: boolean;
	isCognate: boolean;
	isFalseCognate: boolean;
	grammaticalInfo?: {
		[key: string]: string | boolean | string[] | number;
	};
}

export interface IStoredPunctuationSign {
	tokenId: string;
	content: string;
	tokenType: string;
}

export interface IStoredEmoji {
	tokenId: string;
	content: string;
	tokenType: string;
}

export type StoredToken = IStoredWord | IStoredPunctuationSign | IStoredEmoji;
