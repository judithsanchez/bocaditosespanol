import {AddSongRequest, ISentence, ISong} from '../../../lib/types';
import {IAdjective} from './grammaticalInfo/adjectivesTypes';
import {IAdverb} from './grammaticalInfo/adverbsTypes';
import {IArticle} from './grammaticalInfo/articlesTypes';
import {IConjunction} from './grammaticalInfo/conjunctionsTypes';
import {IDeterminer} from './grammaticalInfo/determinersTypes';
import {IInterjection} from './grammaticalInfo/interjectionsTypes';
import {INoun} from './grammaticalInfo/nounsTypes';
import {INumeral} from './grammaticalInfo/numeralsTypes';
import {IPreposition} from './grammaticalInfo/prepositionsTypes';
import {IPronoun} from './grammaticalInfo/pronounsTypes';
import {IVerb} from './grammaticalInfo/verbsTypes';

export enum TokenType {
	Word = 'word',
	Emoji = 'emoji',
	PunctuationSign = 'punctuationSign',
}

export interface IPunctuationSign {
	tokenType: TokenType.PunctuationSign;
	tokenId: string;
	content: string;
}

export interface IEmoji {
	tokenType: TokenType.Emoji;
	tokenId: string;
	content: string;
}

export interface IWord {
	tokenId: string;
	tokenType: TokenType.Word;
	spanish: string;
	normalizedToken: string;
	english: Promise<string> | string;
	hasSpecialChar: boolean;
	partOfSpeech: Promise<string> | string;
	isSlang: boolean;
	isCognate: boolean;
	isFalseCognate: boolean;
	sentenceContext: string;
	grammaticalInfo?:
		| IVerb
		| INoun
		| IAdjective
		| IAdverb
		| IArticle
		| IConjunction
		| IDeterminer
		| IInterjection
		| INoun
		| INumeral
		| IPreposition
		| IPronoun;
}

export enum PartOfSpeech {
	Noun = 'noun',
	Verb = 'verb',
	Adjective = 'adjective',
	Adverb = 'adverb',
	Pronoun = 'pronoun',
	Determiner = 'determiner',
	Article = 'article',
	Preposition = 'preposition',
	Conjunction = 'conjunction',
	Interjection = 'interjection',
	Numeral = 'numeral',
}

export enum GrammaticalNumber {
	Singular = 'singular',
	Plural = 'plural',
}

export enum GrammaticalPerson {
	FirstSingular = 'firstSingular',
	SecondSingular = 'secondSingular',
	ThirdSingular = 'thirdSingular',
	FirstPlural = 'firstPlural',
	SecondPlural = 'secondPlural',
	ThirdPlural = 'thirdPlural',
}

export enum GrammaticalGender {
	Masculine = 'masculine',
	Feminine = 'feminine',
	Neutral = 'neutral',
	Common = 'common',
	Ambiguous = 'ambiguous',
}

export interface ITextProcessor {
	splittedParagraph: string[];
	formattedSentences: ISentence[];
	originalSentencesIds: string[];
	formattedTextEntry: ISong; // TODO: later add IVideoTranscript
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
	getOriginalSentencesIds(sentences: ISentence[]): string[];
	formatTextEntry(
		requestBody: AddSongRequest,
		originalSentencesIds: string[],
	): ISong;
	tokenizeSentences(sentences: ISentence[]): ISentence[];
	deduplicateSentences(sentences: ISentence[]): ISentence[];
	deduplicateTokens(
		tokens: Array<IWord | IPunctuationSign | IEmoji>,
	): Array<IWord | IPunctuationSign | IEmoji>;
	enrichTokens(
		tokens: Array<IWord | IPunctuationSign | IEmoji>,
	): Promise<Array<IWord | IPunctuationSign | IEmoji>>;

	processText(): Promise<void>;
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
