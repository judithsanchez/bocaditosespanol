import {ISentence} from '../../../lib/types';
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

export type TokenType = 'word' | 'emoji' | 'punctuationSign';

export interface IWord {
	wordId: string;
	spanish: string;
	normalizedToken: string;
	english: Promise<string> | string;
	hasSpecialChar: boolean;
	partOfSpeech: Promise<string> | string;
	isSlang: boolean;
	isCognate: boolean;
	isFalseCognate: boolean;
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
	processedText: ISentence[];
	textData: string;
	formattedSentences: ISentence[];
	enrichedSentences: ISentence[];
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
