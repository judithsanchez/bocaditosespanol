import {
	IAdjective,
	IAdverb,
	IArticle,
	IConjunction,
	IDeterminer,
	IInterjection,
	INoun,
	INumeral,
	IPreposition,
	IPronoun,
	IVerb,
} from './partsOfSpeech';

export interface ISentence {
	sentenceId: string;
	content: string;
	translations: {
		english: {
			literal: Promise<string> | string;
			contextual: Promise<string> | string;
		};
	};
	tokenIds: string[];
}

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
	content: string;
	normalizedToken: string;
	translations: {english: Promise<string[]> | string[]};
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

export interface IText {
	content: string;
}
