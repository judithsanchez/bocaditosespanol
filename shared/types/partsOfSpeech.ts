import {
	GrammaticalGender,
	GrammaticalNumber,
	GrammaticalPerson,
} from '@shared/types/common';

export interface INoun {
	gender: GrammaticalGender | '';
	number: GrammaticalNumber | '';
	isProperNoun: boolean;
	diminutive?: boolean;
}

export interface IAdjective {
	gender: GrammaticalGender | '';
	number: GrammaticalNumber | '';
	isPastParticiple?: boolean;
}

export interface IAdverb {
	adverbType: AdverbType | '';
	usesMente?: boolean | '';
}

export enum AdverbType {
	Manner = 'manner',
	Time = 'time',
	Place = 'place',
	Degree = 'degree',
	Affirmation = 'affirmation',
	Negation = 'negation',
	Interrogative = 'interrogative',
	Exclamative = 'exclamative',
	Doubt = 'doubt',
}

export interface IArticle {
	articleType: ArticleType | '';
	gender: GrammaticalGender | '';
	number: GrammaticalNumber | '';
}

export enum ArticleType {
	DEFINITE = 'definite',
	INDEFINITE = 'indefinite',
}

export enum ConjunctionType {
	coordinating = 'coordinating',
	subordinating = 'subordinating',
}

export enum ConjunctionFunction {
	additive = 'additive',
	adversative = 'adversative',
	disjunctive = 'disjunctive',
	causal = 'causal',
	temporal = 'temporal',
	conditional = 'conditional',
	concessive = 'concessive',
	consecutive = 'consecutive',
	comparative = 'comparative',
	final = 'final',
	modal = 'modal',
}

export interface IConjunction {
	conjunctionType: ConjunctionType | '';
	conjunctionFunction: ConjunctionFunction | '';
}

export enum DeterminerType {
	Demonstrative = 'demonstrative',
	Possessive = 'possessive',
	Indefinite = 'indefinite',
	Interrogative = 'interrogative',
	Exclamative = 'exclamative',
	Relative = 'relative',
}
export interface IDeterminer {
	determinerType: DeterminerType | '';
	gender: GrammaticalGender | '';
	number: GrammaticalNumber | '';
}

export enum InterjectionEmotion {
	SURPRISE = 'surprise',
	JOY = 'joy',
	PAIN = 'pain',
	ANGER = 'anger',
	GREETING = 'greeting',
	OTHER = 'other',
}

export enum InterjectionType {
	ONOMATOPOEIC = 'onomatopoeic',
	COURTESY = 'courtesy',
	EMPHATIC = 'emphatic',
	VULGAR = 'vulgar',
	GENERIC = 'generic',
}

export interface IInterjection {
	interjectionEmotion: InterjectionEmotion | '';
	interjectoinType?: InterjectionType | '';
}

export enum NumeralType {
	Cardinal = 'cardinal',
	Ordinal = 'ordinal',
	Multiplicative = 'multiplicative',
	Fractional = 'fractional',
}
export interface INumeral {
	numeralType: NumeralType | '';
	gender?: GrammaticalGender | '';
	number?: GrammaticalNumber | '';
}

export enum PrepositionType {
	Simple = 'simple',
	Compound = 'compound',
	Locution = 'locution',
}

export enum ContractsWith {
	Article = 'article',
	Pronoun = 'pronoun',
}

export interface IPreposition {
	prepositionType: PrepositionType | '';
	contractsWith?: ContractsWith | '';
}

export enum PronounType {
	Personal = 'personal',
	Demonstrative = 'demonstrative',
	Possessive = 'possessive',
	Relative = 'relative',
	Interrogative = 'interrogative',
	Exclamative = 'exclamative',
	Indefinite = 'indefinite',
	Negative = 'negative',
}

export enum PronounCase {
	Nominative = 'nominative',
	Accusative = 'accusative',
	Dative = 'dative',
	Prepositional = 'prepositional',
}

export interface IPronoun {
	pronounType: PronounType | '';
	person?: GrammaticalPerson | '';
	gender?: GrammaticalGender | '';
	number?: GrammaticalNumber | '';
	case?: PronounCase | '';
	isReflexive?: boolean;
	isReciprocal?: boolean;
}

export interface IVerb {
	tense: VerbTense[] | [];
	mood: VerbMood | '';
	person: GrammaticalPerson[] | [];
	number: '';
	isRegular: boolean;
	infinitive: string | '';
	voice: VerbVoice | '';
	verbClass: VerbClass | '';
	gerund: boolean;
	pastParticiple: boolean;
	verbRegularity: VerbRegularity | '';
	isReflexive: boolean;
}

export enum VerbTense {
	Present = 'present',
	PresentPerfect = 'presentPerfect',
	Imperfect = 'imperfect',
	Preterite = 'preterite',
	PastPerfect = 'pastPerfect',
	Future = 'future',
	FuturePerfect = 'futurePerfect',
	Conditional = 'conditional',
	ConditionalPerfect = 'conditionalPerfect',

	SubjunctivePresent = 'subjunctivePresent',
	SubjunctivePerfect = 'subjunctivePerfect',
	SubjunctiveImperfect = 'subjunctiveImperfect',
	SubjunctivePastPerfect = 'subjunctivePastPerfect',
	SubjunctiveFuture = 'subjunctiveFuture',
	SubjunctiveFuturePerfect = 'subjunctiveFuturePerfect',
}

export enum VerbMood {
	Indicative = 'indicative',
	Subjunctive = 'subjunctive',
	Imperative = 'imperative',
	Infinitive = 'infinitive',
	Gerund = 'gerund',
	Participle = 'participle',
}

export enum VerbRegularity {
	Regular = 'regular',
	IrregularStem = 'stemChange',
	IrregularAll = 'irregular',
}

export enum VerbVoice {
	Active = 'active',
	Passive = 'passive',
}

export enum VerbClass {
	Transitive = 'transitive',
	Intransitive = 'intransitive',
	Pronominal = 'pronominal',
	Copulative = 'copulative',
	Impersonal = 'impersonal',
}

// export enum ConjugationPattern {
// 	AR = 'ar',
// 	ER = 'er',
// 	IR = 'ir',

// 	E_IE = 'e->ie',
// 	O_UE = 'o->ue',
// 	E_I = 'e->i',
// 	U_UE = 'u->ue',
// 	I_IE = 'i->ie',

// 	G_ADDITION = 'g-add',
// 	C_ZC = 'c->zc',
// 	I_Y = 'i->y',

// 	IR_E_I = 'ir_e->i',
// 	ER_O_UE = 'er_o->ue',
// 	AR_E_IE = 'ar_e->ie',
// }
