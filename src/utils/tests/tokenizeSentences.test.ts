import {errors} from 'lib/constants';
import {tokenizeSentences} from '../tokenizeSentences';
import {IToken, TokenType} from 'lib/types';

describe('tokenizeSentences', () => {
	test('tokenizes a simple sentence correctly', () => {
		const sentence = 'Hello, world!';
		const expected: IToken[] = [
			{
				token: {
					spanish: 'Hello',
					normalizedToken: 'hello',
					hasSpecialChar: false,
				},
				type: TokenType.Word,
			},
			{token: ',', type: TokenType.PunctuationSign},
			{
				token: {
					spanish: 'world',
					normalizedToken: 'world',
					hasSpecialChar: false,
				},
				type: TokenType.Word,
			},
			{token: '!', type: TokenType.PunctuationSign},
		];
		const result = tokenizeSentences(sentence);
		expect(result.tokens).toEqual(expected);
	});

	test('tokenizes a sentence with multiple punctuation marks correctly', () => {
		const sentence = 'Hello, world! How are you?';
		const expected: IToken[] = [
			{
				token: {
					spanish: 'Hello',
					normalizedToken: 'hello',
					hasSpecialChar: false,
				},
				type: TokenType.Word,
			},
			{token: ',', type: TokenType.PunctuationSign},
			{
				token: {
					spanish: 'world',
					normalizedToken: 'world',
					hasSpecialChar: false,
				},
				type: TokenType.Word,
			},
			{token: '!', type: TokenType.PunctuationSign},
			{
				token: {spanish: 'How', normalizedToken: 'how', hasSpecialChar: false},
				type: TokenType.Word,
			},
			{
				token: {spanish: 'are', normalizedToken: 'are', hasSpecialChar: false},
				type: TokenType.Word,
			},
			{
				token: {spanish: 'you', normalizedToken: 'you', hasSpecialChar: false},
				type: TokenType.Word,
			},
			{token: '?', type: TokenType.PunctuationSign},
		];
		const result = tokenizeSentences(sentence);
		expect(result.tokens).toEqual(expected);
	});

	test('tokenizes a sentence with emojis correctly', () => {
		const sentence = 'Hello 👋🏻, world! 😀';
		const expected: IToken[] = [
			{
				token: {
					spanish: 'Hello',
					normalizedToken: 'hello',
					hasSpecialChar: false,
				},
				type: TokenType.Word,
			},
			{token: '👋🏻', type: TokenType.Emoji},
			{token: ',', type: TokenType.PunctuationSign},
			{
				token: {
					spanish: 'world',
					normalizedToken: 'world',
					hasSpecialChar: false,
				},
				type: TokenType.Word,
			},
			{token: '!', type: TokenType.PunctuationSign},
			{token: '😀', type: TokenType.Emoji},
		];
		const result = tokenizeSentences(sentence);
		expect(result.tokens).toEqual(expected);
	});

	test('tokenizes a sentence with ellipsis correctly', () => {
		const sentence = 'Hello... world!';
		const expected: IToken[] = [
			{
				token: {
					spanish: 'Hello',
					normalizedToken: 'hello',
					hasSpecialChar: false,
				},
				type: TokenType.Word,
			},
			{token: '...', type: TokenType.PunctuationSign},
			{
				token: {
					spanish: 'world',
					normalizedToken: 'world',
					hasSpecialChar: false,
				},
				type: TokenType.Word,
			},
			{token: '!', type: TokenType.PunctuationSign},
		];
		const result = tokenizeSentences(sentence);
		expect(result.tokens).toEqual(expected);
	});

	test('handles emojis with skin tone modifiers', () => {
		const sentence = '👋🏻 👋🏼 👋🏽 👋🏾 👋🏿';
		const expected: IToken[] = [
			{token: '👋🏻', type: TokenType.Emoji},
			{token: '👋🏼', type: TokenType.Emoji},
			{token: '👋🏽', type: TokenType.Emoji},
			{token: '👋🏾', type: TokenType.Emoji},
			{token: '👋🏿', type: TokenType.Emoji},
		];
		const result = tokenizeSentences(sentence);
		expect(result.tokens).toEqual(expected);
	});
	test('handles emojis with gender modifiers', () => {
		const sentence = '👨‍💻 👩‍💻';
		const expected: IToken[] = [
			{token: '👨‍💻', type: TokenType.Emoji},
			{token: '👩‍💻', type: TokenType.Emoji},
		];
		const result = tokenizeSentences(sentence);
		expect(result.tokens).toEqual(expected);
	});

	test('handles emojis with multiple modifiers', () => {
		const sentence = '👩🏽‍💻 👨🏼‍🍳';
		const expected: IToken[] = [
			{token: '👩🏽‍💻', type: TokenType.Emoji},
			{token: '👨🏼‍🍳', type: TokenType.Emoji},
		];
		const result = tokenizeSentences(sentence);
		expect(result.tokens).toEqual(expected);
	});

	test('handles emojis with and without modifiers', () => {
		const sentence = '👋🏻 👋 👩🏽‍💻 👨‍🍳';
		const expected: IToken[] = [
			{token: '👋🏻', type: TokenType.Emoji},
			{token: '👋', type: TokenType.Emoji},
			{token: '👩🏽‍💻', type: TokenType.Emoji},
			{token: '👨‍🍳', type: TokenType.Emoji},
		];
		const result = tokenizeSentences(sentence);
		expect(result.tokens).toEqual(expected);
	});

	test('throws an error when input is not a string', () => {
		expect(() => tokenizeSentences(123 as unknown as string)).toThrow(
			errors.mustBeString,
		);
		expect(() => tokenizeSentences(undefined as unknown as string)).toThrow(
			errors.mustBeString,
		);
		expect(() => tokenizeSentences(false as unknown as string)).toThrow(
			errors.mustBeString,
		);
	});
	test('throws an error for an empty string', () => {
		const sentence = '';
		expect(() => tokenizeSentences(sentence)).toThrow(
			'Cannot tokenize an empty sentence',
		);
	});
});
