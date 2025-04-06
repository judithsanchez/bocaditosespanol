import emojiRegex from 'emoji-regex';
import {
	EmojiToken,
	emojiTokenSchema,
	PunctuationToken,
	punctuationTokenSchema,
	Token,
	TokenType,
	WordToken,
	wordTokenSchema,
} from '../types/token';
import {ISense} from '../types/sense';

export class TokenFactory {
	private static readonly emojiPattern = emojiRegex();
	private static readonly punctuationPattern = /^[.?!¡¿,:;'"\\s-]+$/;

	static splitIntoTokens(content: string): string[] {
		const trimmedContent = content.trim().replace(/\s+/g, ' ');
		const pattern = `(${this.emojiPattern.source}|\\.{3}|[.?!¡¿,:;'"\\s-])`;
		const regex = new RegExp(pattern, 'gu');

		return trimmedContent.split(regex).filter(token => token.trim() !== '');
	}

	static createToken(content: string): Token {
		if (this.emojiPattern.test(content)) {
			return this.createEmojiToken(content);
		}
		if (this.punctuationPattern.test(content)) {
			return this.createPunctuationToken(content);
		}
		return this.createWordToken(content);
	}

	static createEmojiToken(content: string): EmojiToken {
		const token = {
			tokenId: `token-${content}`,
			content,
			tokenType: TokenType.Emoji as const,
		};
		return emojiTokenSchema.parse(token);
	}

	static createPunctuationToken(content: string): PunctuationToken {
		const token = {
			tokenId: `token-${content}`,
			content,
			tokenType: TokenType.PunctuationSign as const,
		};
		return punctuationTokenSchema.parse(token);
	}

	static createWordToken(content: string): WordToken {
		const normalizedContent = content.toLowerCase();
		const token = {
			tokenId: `token-${normalizedContent}`,
			content,
			normalizedToken: normalizedContent,
			tokenType: TokenType.Word as const,
			isSlang: false,
			isCognate: false,
			isFalseCognate: false,
			senses: [this.createInitialSense(normalizedContent)],
			lastUpdated: Date.now(),
		};
		return wordTokenSchema.parse(token);
	}

	private static createInitialSense(tokenId: string): ISense {
		return {
			senseId: '',
			tokenId: `token-${tokenId}`,
			content: '',
			hasSpecialChar: false,
			translations: {english: []},
			lastUpdated: Date.now(),
		};
	}
}
