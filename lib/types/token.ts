import {z} from 'zod';
import {ISense, senseSchema} from './sense';

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
	senses: z.array(senseSchema),
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
