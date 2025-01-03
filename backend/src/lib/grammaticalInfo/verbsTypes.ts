import {GrammaticalNumber, GrammaticalPerson} from 'lib/types';

export interface IVerb {
	tense: VerbTense;
	mood: VerbMood;
	person: GrammaticalPerson;
	number: GrammaticalNumber;
	isRegular: boolean;
	infinitive: string;
	conjugationPattern: ConjugationPattern;
	voice?: 'active' | 'passive';
	verbClass?:
		| 'transitive'
		| 'intransitive'
		| 'pronominal'
		| 'copulative'
		| 'impersonal';
	gerund?: boolean;
	pastParticiple?: boolean;
	auxiliary?: 'haber' | 'ser' | 'estar';
	verbRegularity?: VerbRegularity;
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

export enum ConjugationPattern {
	AR = 'ar',
	ER = 'er',
	IR = 'ir',

	E_IE = 'e->ie',
	O_UE = 'o->ue',
	E_I = 'e->i',
	U_UE = 'u->ue',
	I_IE = 'i->ie',

	IRREGULAR = 'irregular',
	G_ADDITION = 'g-add',
	C_ZC = 'c->zc',
	I_Y = 'i->y',

	IR_E_I = 'ir_e->i',
	ER_O_UE = 'er_o->ue',
	AR_E_IE = 'ar_e->ie',
}
