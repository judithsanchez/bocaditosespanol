import {z} from 'zod';
import {IInitialSense, ISense, initialSenseSchema, senseSchema} from './sense';

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

// Schema for the initial word token state
export const initialWordTokenSchema = baseTokenSchema.extend({
	tokenType: z.literal(TokenType.Word),
	normalizedToken: z.string(),
	isSlang: z.boolean(),
	isCognate: z.boolean(),
	isFalseCognate: z.boolean(),
	lastUpdated: z.number(),
	senses: z.array(initialSenseSchema), // Use initial schema for creation
});

// Schema for the fully processed word token
export const wordTokenSchema = initialWordTokenSchema.extend({
	// Extend the initial schema
	senses: z.array(senseSchema), // Use the final sense schema here
});

export const tokenSchema = z.discriminatedUnion('tokenType', [
	emojiTokenSchema,
	punctuationTokenSchema,
	wordTokenSchema, // Use the final word token schema here
]);

export type EmojiToken = z.infer<typeof emojiTokenSchema>;
export type PunctuationToken = z.infer<typeof punctuationTokenSchema>;
export type InitialWordToken = z.infer<typeof initialWordTokenSchema>; // Type for initial state
export type WordToken = z.infer<typeof wordTokenSchema>; // Type for final state
export type Token = EmojiToken | PunctuationToken | WordToken; // Final token types

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
	senses: ISense[]; // Interface represents the final state
}

// Interface for the initial word state might be useful too
export interface IInitialWord extends Omit<IWord, 'senses'> {
	senses: IInitialSense[];
}
