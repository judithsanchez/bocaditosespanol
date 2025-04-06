import {z} from 'zod';
import {
	GrammaticalGender,
	GrammaticalNumber,
	GrammaticalPerson,
	grammaticalGenderSchema,
	grammaticalNumberSchema,
	grammaticalPersonSchema,
} from './grammar';

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

export const partOfSpeechSchema = z.nativeEnum(PartOfSpeech);

const emptyOr = <T extends z.ZodType>(schema: T) =>
	z.union([schema, z.literal('')]);

const booleanOrEmpty = z.union([z.boolean(), z.literal('')]);

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

export enum ArticleType {
	DEFINITE = 'definite',
	INDEFINITE = 'indefinite',
}

export enum ConjunctionType {
	Coordinating = 'coordinating',
	Subordinating = 'subordinating',
}

export enum ConjunctionFunction {
	Additive = 'additive',
	Adversative = 'adversative',
	Disjunctive = 'disjunctive',
	Causal = 'causal',
	Temporal = 'temporal',
	Conditional = 'conditional',
	Concessive = 'concessive',
	Consecutive = 'consecutive',
	Comparative = 'comparative',
	Final = 'final',
	Modal = 'modal',
}

export enum DeterminerType {
	Demonstrative = 'demonstrative',
	Possessive = 'possessive',
	Indefinite = 'indefinite',
	Interrogative = 'interrogative',
	Exclamative = 'exclamative',
	Relative = 'relative',
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

export enum NumeralType {
	Cardinal = 'cardinal',
	Ordinal = 'ordinal',
	Multiplicative = 'multiplicative',
	Fractional = 'fractional',
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

export const adverbTypeSchema = z.nativeEnum(AdverbType);
export const articleTypeSchema = z.nativeEnum(ArticleType);
export const conjunctionTypeSchema = z.nativeEnum(ConjunctionType);
export const conjunctionFunctionSchema = z.nativeEnum(ConjunctionFunction);
export const determinerTypeSchema = z.nativeEnum(DeterminerType);
export const interjectionEmotionSchema = z.nativeEnum(InterjectionEmotion);
export const interjectionTypeSchema = z.nativeEnum(InterjectionType);
export const numeralTypeSchema = z.nativeEnum(NumeralType);
export const prepositionTypeSchema = z.nativeEnum(PrepositionType);
export const contractsWithSchema = z.nativeEnum(ContractsWith);
export const pronounTypeSchema = z.nativeEnum(PronounType);
export const pronounCaseSchema = z.nativeEnum(PronounCase);
export const verbTenseSchema = z.nativeEnum(VerbTense);
export const verbMoodSchema = z.nativeEnum(VerbMood);
export const verbRegularitySchema = z.nativeEnum(VerbRegularity);
export const verbVoiceSchema = z.nativeEnum(VerbVoice);
export const verbClassSchema = z.nativeEnum(VerbClass);

export const nounSchema = z.object({
	type: z.literal(PartOfSpeech.Noun),
	gender: emptyOr(grammaticalGenderSchema),
	number: emptyOr(grammaticalNumberSchema),
	isProperNoun: z.boolean(),
	diminutive: z.boolean().optional(),
});

export const adjectiveSchema = z.object({
	type: z.literal(PartOfSpeech.Adjective),
	gender: emptyOr(grammaticalGenderSchema),
	number: emptyOr(grammaticalNumberSchema),
	isPastParticiple: z.boolean().optional(),
});

export const adverbSchema = z.object({
	type: z.literal(PartOfSpeech.Adverb),
	adverbType: emptyOr(adverbTypeSchema),
	usesMente: booleanOrEmpty.optional(),
});

export const articleSchema = z.object({
	type: z.literal(PartOfSpeech.Article),
	articleType: emptyOr(articleTypeSchema),
	gender: emptyOr(grammaticalGenderSchema),
	number: emptyOr(grammaticalNumberSchema),
});

export const conjunctionSchema = z.object({
	type: z.literal(PartOfSpeech.Conjunction),
	conjunctionType: emptyOr(conjunctionTypeSchema),
	conjunctionFunction: emptyOr(conjunctionFunctionSchema),
});

export const determinerSchema = z.object({
	type: z.literal(PartOfSpeech.Determiner),
	determinerType: emptyOr(determinerTypeSchema),
	gender: emptyOr(grammaticalGenderSchema),
	number: emptyOr(grammaticalNumberSchema),
});

export const interjectionSchema = z.object({
	type: z.literal(PartOfSpeech.Interjection),
	interjectionEmotion: emptyOr(interjectionEmotionSchema),
	interjectionType: emptyOr(interjectionTypeSchema).optional(),
});

export const numeralSchema = z.object({
	type: z.literal(PartOfSpeech.Numeral),
	numeralType: emptyOr(numeralTypeSchema),
	gender: emptyOr(grammaticalGenderSchema).optional(),
	number: emptyOr(grammaticalNumberSchema).optional(),
});

export const prepositionSchema = z.object({
	type: z.literal(PartOfSpeech.Preposition),
	prepositionType: emptyOr(prepositionTypeSchema),
	contractsWith: emptyOr(contractsWithSchema).optional(),
});

export const pronounSchema = z.object({
	type: z.literal(PartOfSpeech.Pronoun),
	pronounType: emptyOr(pronounTypeSchema),
	person: emptyOr(grammaticalPersonSchema).optional(),
	gender: emptyOr(grammaticalGenderSchema).optional(),
	number: emptyOr(grammaticalNumberSchema).optional(),
	case: emptyOr(pronounCaseSchema).optional(),
	isReflexive: z.boolean().optional(),
	isReciprocal: z.boolean().optional(),
});

export const verbSchema = z.object({
	type: z.literal(PartOfSpeech.Verb),
	tense: z.array(verbTenseSchema).or(z.array(z.never())),
	mood: emptyOr(verbMoodSchema),
	person: z.array(grammaticalPersonSchema).or(z.array(z.never())),
	number: emptyOr(grammaticalNumberSchema), // Fixed: Changed from literal to enum
	isRegular: z.boolean(),
	infinitive: emptyOr(z.string()),
	voice: emptyOr(verbVoiceSchema),
	verbClass: emptyOr(verbClassSchema),
	gerund: z.boolean(),
	pastParticiple: z.boolean(),
	verbRegularity: emptyOr(verbRegularitySchema),
	isReflexive: z.boolean(),
});

export const grammaticalInfoSchema = z.discriminatedUnion('type', [
	nounSchema,
	adjectiveSchema,
	adverbSchema,
	articleSchema,
	conjunctionSchema,
	determinerSchema,
	interjectionSchema,
	numeralSchema,
	prepositionSchema,
	pronounSchema,
	verbSchema,
]);

export type GrammaticalInfo = z.infer<typeof grammaticalInfoSchema>;

export type INoun = z.infer<typeof nounSchema>;
export type IAdjective = z.infer<typeof adjectiveSchema>;
export type IAdverb = z.infer<typeof adverbSchema>;
export type IArticle = z.infer<typeof articleSchema>;
export type IConjunction = z.infer<typeof conjunctionSchema>;
export type IDeterminer = z.infer<typeof determinerSchema>;
export type IInterjection = z.infer<typeof interjectionSchema>;
export type INumeral = z.infer<typeof numeralSchema>;
export type IPreposition = z.infer<typeof prepositionSchema>;
export type IPronoun = z.infer<typeof pronounSchema>;
export type IVerb = z.infer<typeof verbSchema>;

export const senseSchema = z.object({
	definition: z.string(),
	examples: z.array(z.string()),
	synonyms: z.array(z.string()),
	antonyms: z.array(z.string()),
	register: z.string(),
	usage: z.string(),
});

export type ISense = z.infer<typeof senseSchema>;
