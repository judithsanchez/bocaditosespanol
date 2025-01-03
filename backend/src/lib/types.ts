import {ISentence} from '../../../lib/types';
import {IAdjective} from './grammaticalInfo/adjectivesTypes';
import {IAdverb} from './grammaticalInfo/adverbsTypes';
import {INoun} from './grammaticalInfo/nounsTypes';
import {IVerb} from './grammaticalInfo/verbsTypes';

export type TokenType = 'word' | 'emoji' | 'punctuationSign';

export interface IWord {
	spanish: string;
	normalizedToken: string;
	english?: Promise<string> | string;
	hasSpecialChar: boolean;
	wordtType?: Promise<string> | string;
	isSlang?: boolean;
	isCognate?: boolean;
	isFalseCognate?: boolean;
	grammaticalInfo?: IVerb | INoun | IAdjective | IAdverb;
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
