import {z} from 'zod';
import {IInitialSense, ISense, initialSenseSchema, senseSchema} from './sense';
import {ProcessingState, processingStateSchema} from './processing'; // Import ProcessingState and processingStateSchema

export enum TokenType {
	Word = 'word',
	Emoji = 'emoji',
	PunctuationSign = 'punctuationSign',
}

const baseTokenSchema = z.object({
	tokenId: z.string(),
	content: z.string(),
	// Add processingState to the base schema for all tokens
	// It needs a default value or to be explicitly set during token creation.
	// For now, let's add it. If it causes issues with existing data/logic,
	// we might need to make it optional or provide a default.
	processingState: processingStateSchema,
});

export const emojiTokenSchema = baseTokenSchema.extend({
	tokenType: z.literal(TokenType.Emoji),
	lastUpdated: z.number().optional(), // Added optional lastUpdated
});

export const punctuationTokenSchema = baseTokenSchema.extend({
	tokenType: z.literal(TokenType.PunctuationSign),
	lastUpdated: z.number().optional(), // Added optional lastUpdated
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
	// Add processingState to schemas if it's to be validated by Zod
	// For now, focusing on interfaces. Zod schemas can be updated later if needed.
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

// --- REFACTOR TOKEN INTERFACES TO INCLUDE ProcessingState ---

export interface BaseToken {
	// New BaseToken interface
	tokenId: string;
	content: string;
	tokenType: TokenType;
	processingState: ProcessingState; // Added ProcessingState
	lastUpdated?: number; // Optional, as some schemas have it, some don't
}

export interface EmojiToken extends BaseToken {
	// Extends new BaseToken
	tokenType: TokenType.Emoji;
}

export interface PunctuationToken extends BaseToken {
	// Extends new BaseToken
	tokenType: TokenType.PunctuationSign;
}

export interface InitialWordToken extends BaseToken {
	// Extends new BaseToken
	tokenType: TokenType.Word;
	normalizedToken: string;
	isSlang: boolean;
	isCognate: boolean;
	isFalseCognate: boolean;
	senses: IInitialSense[];
	// lastUpdated is in BaseToken
}

export interface WordToken extends BaseToken {
	// Extends new BaseToken
	tokenType: TokenType.Word;
	normalizedToken: string;
	isSlang: boolean;
	isCognate: boolean;
	isFalseCognate: boolean;
	senses: ISense[];
	// lastUpdated is in BaseToken
	// Potentially add specific analysis results here if not part of senses
}

// Combined Token type using new interfaces
// Including InitialWordToken to represent words before full sense enrichment
export type Token =
	| EmojiToken
	| PunctuationToken
	| InitialWordToken
	| WordToken;

// Old Zod-inferred types and old direct interfaces removed.
// The new interfaces (BaseToken, EmojiToken, PunctuationToken, InitialWordToken, WordToken)
// and the combined 'Token' type are now the source of truth for token structures.
// Zod schemas (baseTokenSchema, emojiTokenSchema, etc.) are used for validation
// and their inferred types would match these new interfaces.
