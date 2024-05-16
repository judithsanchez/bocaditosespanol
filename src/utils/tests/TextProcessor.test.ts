import {TextProcessor} from '../TextProcessor';
import {errors} from '../../lib/constants';
import {IToken, TokenType} from '../../lib/types';

describe('TextProcessor', () => {
	describe('constructor', () => {
		test('should throw an error when textData is empty', () => {
			expect(() => new TextProcessor('')).toThrow(errors.invalidData);
		});
	});

	describe('processTextData', () => {
		let textProcessor: TextProcessor;

		beforeEach(() => {
			textProcessor = new TextProcessor('This is a sample text.');
		});

		test('should throw an error when text is empty', () => {
			expect(() => textProcessor.processTextData('')).toThrow(
				errors.invalidText,
			);
		});

		test('should return an array of sentences when text contains a single sentence', () => {
			const text = 'This is a sample text.';
			const result = textProcessor.processTextData(text);
			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({
				sentence: 'This is a sample text.',
				tokens: [
					{
						token: {
							spanish: 'This',
							normalizedToken: 'this',
							hasSpecialChar: false,
						},
						type: TokenType.Word,
					},
					{
						token: {
							spanish: 'is',
							normalizedToken: 'is',
							hasSpecialChar: false,
						},
						type: TokenType.Word,
					},
					{
						token: {spanish: 'a', normalizedToken: 'a', hasSpecialChar: false},
						type: TokenType.Word,
					},
					{
						token: {
							spanish: 'sample',
							normalizedToken: 'sample',
							hasSpecialChar: false,
						},
						type: TokenType.Word,
					},
					{
						token: {
							spanish: 'text',
							normalizedToken: 'text',
							hasSpecialChar: false,
						},
						type: TokenType.Word,
					},
					{token: '.', type: TokenType.PunctuationSign},
				],
			});
		});

		test('should return an array of sentences when text contains multiple sentences', () => {
			const text = 'This is a sample text. It has multiple sentences.';
			const result = textProcessor.processTextData(text);
			expect(result).toHaveLength(2);
			expect(result[0]).toEqual({
				sentence: 'This is a sample text.',
				tokens: [
					{
						token: {
							spanish: 'This',
							normalizedToken: 'this',
							hasSpecialChar: false,
						},
						type: TokenType.Word,
					},
					{
						token: {
							spanish: 'is',
							normalizedToken: 'is',
							hasSpecialChar: false,
						},
						type: TokenType.Word,
					},
					{
						token: {spanish: 'a', normalizedToken: 'a', hasSpecialChar: false},
						type: TokenType.Word,
					},
					{
						token: {
							spanish: 'sample',
							normalizedToken: 'sample',
							hasSpecialChar: false,
						},
						type: TokenType.Word,
					},
					{
						token: {
							spanish: 'text',
							normalizedToken: 'text',
							hasSpecialChar: false,
						},
						type: TokenType.Word,
					},
					{token: '.', type: TokenType.PunctuationSign},
				],
			});
			expect(result[1]).toEqual({
				sentence: 'It has multiple sentences.',
				tokens: [
					{
						token: {
							spanish: 'It',
							normalizedToken: 'it',
							hasSpecialChar: false,
						},
						type: TokenType.Word,
					},
					{
						token: {
							spanish: 'has',
							normalizedToken: 'has',
							hasSpecialChar: false,
						},
						type: TokenType.Word,
					},
					{
						token: {
							spanish: 'multiple',
							normalizedToken: 'multiple',
							hasSpecialChar: false,
						},
						type: TokenType.Word,
					},
					{
						token: {
							spanish: 'sentences',
							normalizedToken: 'sentences',
							hasSpecialChar: false,
						},
						type: TokenType.Word,
					},
					{token: '.', type: TokenType.PunctuationSign},
				],
			});
		});

		test('should normalize and tokenize sentences correctly', () => {
			const text = 'Hello, áéíóú! Über mañana.';
			const result = textProcessor.processTextData(text);
			expect(result).toHaveLength(2);
			expect(result[0]).toEqual({
				sentence: 'Hello, áéíóú!',
				tokens: [
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
							spanish: 'áéíóú',
							normalizedToken: 'aeiou',
							hasSpecialChar: true,
						},
						type: TokenType.Word,
					},
					{token: '!', type: TokenType.PunctuationSign},
				],
			});
			expect(result[1]).toEqual({
				sentence: 'Über mañana.',
				tokens: [
					{
						token: {
							spanish: 'Über',
							normalizedToken: 'uber',
							hasSpecialChar: true,
						},
						type: TokenType.Word,
					},
					{
						token: {
							spanish: 'mañana',
							normalizedToken: 'manana',
							hasSpecialChar: true,
						},
						type: TokenType.Word,
					},
					{token: '.', type: TokenType.PunctuationSign},
				],
			});
		});

		test('should handle emojis and punctuation correctly', () => {
			const text = 'Hello 👋🏻, world! 😀 How are you?';
			const result = textProcessor.processTextData(text);
			expect(result).toHaveLength(2);
			expect(result[0]).toEqual({
				sentence: 'Hello 👋🏻, world!',
				tokens: [
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
				],
			});
			expect(result[1]).toEqual({
				sentence: '😀 How are you?',
				tokens: [
					{token: '😀', type: TokenType.Emoji},
					{
						token: {
							spanish: 'How',
							normalizedToken: 'how',
							hasSpecialChar: false,
						},
						type: TokenType.Word,
					},
					{
						token: {
							spanish: 'are',
							normalizedToken: 'are',
							hasSpecialChar: false,
						},
						type: TokenType.Word,
					},
					{
						token: {
							spanish: 'you',
							normalizedToken: 'you',
							hasSpecialChar: false,
						},
						type: TokenType.Word,
					},
					{token: '?', type: TokenType.PunctuationSign},
				],
			});
		});
	});
});
