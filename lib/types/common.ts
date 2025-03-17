import {z} from 'zod';

export const songRequestSchema = z.object({
	interpreter: z.string().min(1),
	feat: z.array(z.string()).optional(),
	title: z.string().min(1),
	youtube: z.string().url(),
	genre: z.array(z.string()),
	language: z.object({
		main: z.string(),
		variant: z.array(z.string()),
	}),
	releaseDate: z.string(),
	lyrics: z.string().min(1),
});

export type AddSongRequest = z.infer<typeof songRequestSchema>;

export enum ContentType {
	SONG = 'song',
	TRANSCRIPT = 'transcript',
}

export enum Difficulty {
	BEGINNER = 'beginner',
	INTERMEDIATE = 'intermediate',
	ADVANCED = 'advanced',
	EXPERT = 'expert',
	MASTER = 'master',
}

export interface ILearningInsight {
	difficulty?: Difficulty;
	insight?: string;
}

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
	learningInsights?: ILearningInsight;
}

export enum TokenType {
	Word = 'word',
	Emoji = 'emoji',
	PunctuationSign = 'punctuationSign',
}

const baseTokenSchema = z.object({
	tokenId: z.string(),
	content: z.string(),
});

export const emojiTokenSchema = baseTokenSchema.extend({
	tokenType: z.literal(TokenType.Emoji),
});

export const punctuationTokenSchema = baseTokenSchema.extend({
	tokenType: z.literal(TokenType.PunctuationSign),
});

export const wordTokenSchema = baseTokenSchema.extend({
	tokenType: z.literal(TokenType.Word),
	normalizedToken: z.string(),
	isSlang: z.boolean(),
	isCognate: z.boolean(),
	isFalseCognate: z.boolean(),
	lastUpdated: z.number(),
	senses: z.array(
		z.object({
			senseId: z.string(),
			tokenId: z.string(),
			content: z.string(),
			hasSpecialChar: z.boolean(),
			translations: z.object({
				english: z.array(z.string()),
			}),
			partOfSpeech: z.string(),
			grammaticalInfo: z.record(z.any()),
			lastUpdated: z.number(),
		}),
	),
});

export const tokenSchema = z.discriminatedUnion('tokenType', [
	emojiTokenSchema,
	punctuationTokenSchema,
	wordTokenSchema,
]);

export type EmojiToken = z.infer<typeof emojiTokenSchema>;
export type PunctuationToken = z.infer<typeof punctuationTokenSchema>;
export type WordToken = z.infer<typeof wordTokenSchema>;
export type Token = z.infer<typeof tokenSchema>;

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
	isSlang: boolean;
	isCognate: boolean;
	isFalseCognate: boolean;
	lastUpdated: number;
	senses: ISense[];
}
export interface ISense {
	senseId: string;
	tokenId: string;
	content: string;
	hasSpecialChar: boolean;
	translations: {english: string[]};
	partOfSpeech: string;
	grammaticalInfo: Record<string, unknown>;
	lastUpdated: number;
}
export interface IWord {
	tokenId: string;
	tokenType: TokenType.Word;
	content: string;
	normalizedToken: string;
	isSlang: boolean;
	isCognate: boolean;
	isFalseCognate: boolean;
	lastUpdated: number;
	senses: ISense[];
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

export const sentenceSchema = z.object({
	sentenceId: z.string(),
	content: z.string(),
	translations: z.object({
		english: z.object({
			literal: z.string().or(z.instanceof(Promise)),
			contextual: z.string().or(z.instanceof(Promise)),
		}),
	}),
	tokenIds: z.array(z.string()),
	learningInsights: z
		.object({
			difficulty: z.nativeEnum(Difficulty),
			insight: z.string(),
		})
		.optional(),
});

export const formattedSentencesSchema = z.array(sentenceSchema);

export enum LearningMode {
	DEFAULT = 'default',
	HIDE_TRANSLATIONS = 'hideTranslations',
	WRITING_PRACTICE = 'writingPractice',
	LISTENING_PRACTICE = 'listeningPractice',
}
