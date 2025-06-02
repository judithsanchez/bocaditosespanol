import emojiRegex from 'emoji-regex';
import {
	EmojiToken,
	emojiTokenSchema,
	InitialWordToken, // Import the initial word token type
	initialWordTokenSchema, // Import the initial word token schema
	PunctuationToken,
	punctuationTokenSchema,
	Token, // This might need adjustment depending on how Token is used elsewhere
	TokenType,
	WordToken, // Keep this for the final state if needed elsewhere
} from '../types/token';
import {IInitialSense, ISense} from '../types/sense'; // Import IInitialSense
import {ProcessingStage} from '../types/processing'; // Import ProcessingStage

export class TokenFactory {
	private static readonly emojiPattern = emojiRegex();
	private static readonly punctuationPattern = /^[.?!¡¿,:;'"\\s-]+$/;
	private static readonly specialCharPattern = /[áéíóúñüÁÉÍÓÚÑÜ]/;

	static splitIntoTokens(content: string): string[] {
		const trimmedContent = content.trim().replace(/\s+/g, ' ');
		const pattern = `(${this.emojiPattern.source}|\\.{3}|[.?!¡¿,:;'"\\s-])`;
		const regex = new RegExp(pattern, 'gu');

		return trimmedContent.split(regex).filter(token => token.trim() !== '');
	}

	// Adjust return type to include InitialWordToken
	static createToken(
		content: string,
	): EmojiToken | PunctuationToken | InitialWordToken {
		if (this.emojiPattern.test(content)) {
			return this.createEmojiToken(content);
		}
		if (this.punctuationPattern.test(content)) {
			return this.createPunctuationToken(content);
		}
		// Return InitialWordToken here
		return this.createWordToken(content);
	}

	static createEmojiToken(content: string): EmojiToken {
		const now = Date.now();
		const token = {
			tokenId: `token-${content}`,
			content,
			tokenType: TokenType.Emoji as const,
			processingState: {
				stage: ProcessingStage.TOKENIZED,
				startedAt: now,
				completedAt: now,
			},
			// lastUpdated is optional in emojiTokenSchema, can be omitted or set
			lastUpdated: now,
		};
		return emojiTokenSchema.parse(token);
	}

	static createPunctuationToken(content: string): PunctuationToken {
		const now = Date.now();
		const token = {
			tokenId: `token-${content}`,
			content,
			tokenType: TokenType.PunctuationSign as const,
			processingState: {
				stage: ProcessingStage.TOKENIZED,
				startedAt: now,
				completedAt: now,
			},
			// lastUpdated is optional in punctuationTokenSchema, can be omitted or set
			lastUpdated: now,
		};
		return punctuationTokenSchema.parse(token);
	}

	// Update return type and use initial schema
	static createWordToken(content: string): InitialWordToken {
		const now = Date.now();
		const normalizedContent = content.toLowerCase();
		// The type here needs to match what initialWordTokenSchema expects, including processingState
		const token = {
			tokenId: `token-${normalizedContent}`,
			content,
			normalizedToken: normalizedContent,
			tokenType: TokenType.Word as const,
			isSlang: false,
			isCognate: false,
			isFalseCognate: false,
			senses: [this.createInitialSense(normalizedContent)],
			lastUpdated: now,
			processingState: {
				stage: ProcessingStage.TOKENIZED,
				startedAt: now,
				completedAt: now,
			},
		};
		// Use the initial schema for parsing
		return initialWordTokenSchema.parse(token);
	}

	// Update return type to IInitialSense
	private static createInitialSense(tokenId: string): IInitialSense {
		const originalContent = tokenId.replace(/^token-/, ''); // Remove 'token-' prefix to get original content
		const hasSpecialChar = this.specialCharPattern.test(originalContent);

		return {
			senseId: `sense-${tokenId}-${Date.now()}`, // Generate a unique senseId
			tokenId: `token-${tokenId}`, // Use the passed tokenId
			content: '', // Content can be optional or empty initially
			hasSpecialChar,
			translations: {english: []},
			lastUpdated: Date.now(),
		};
	}
}
