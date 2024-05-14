import {errors} from 'utils/lib/constans';
import {tokenizeSentences} from '../tokenizeSentences';

describe('tokenizeSentences', () => {
	test('tokenizes a simple sentence correctly', () => {
		const sentence = 'Hello, world!';
		const expected = {
			sentence: sentence,
			tokens: ['Hello', ',', 'world', '!'],
		};
		const result = tokenizeSentences(sentence);
		expect(result).toEqual(expected);
	});

	test('tokenizes a sentence with multiple punctuation marks correctly', () => {
		const sentence = 'Hello, world! How are you?';
		const expected = {
			sentence: sentence,
			tokens: ['Hello', ',', 'world', '!', 'How', 'are', 'you', '?'],
		};
		const result = tokenizeSentences(sentence);
		expect(result).toEqual(expected);
	});

	test('tokenizes a sentence with emojis correctly', () => {
		const sentence = 'Hello 👋🏻, world! 😀';
		const expected = {
			sentence: sentence,
			tokens: ['Hello', '👋🏻', ',', 'world', '!', '😀'],
		};
		const result = tokenizeSentences(sentence);
		expect(result).toEqual(expected);
	});

	test('tokenizes a sentence with ellipsis correctly', () => {
		const sentence = 'Hello... world!';
		const expected = {
			sentence: sentence,
			tokens: ['Hello', '...', 'world', '!'],
		};
		const result = tokenizeSentences(sentence);
		expect(result).toEqual(expected);
	});

	test('handles emojis with skin tone modifiers', () => {
		const sentence = '👋🏻 👋🏼 👋🏽 👋🏾 👋🏿';
		const expected = {
			sentence: sentence,
			tokens: ['👋🏻', '👋🏼', '👋🏽', '👋🏾', '👋🏿'],
		};
		const result = tokenizeSentences(sentence);
		expect(result).toEqual(expected);
	});

	test('handles emojis with gender modifiers', () => {
		const sentence = '👨‍💻 👩‍💻';
		const expected = {
			sentence: sentence,
			tokens: ['👨‍💻', '👩‍💻'],
		};
		const result = tokenizeSentences(sentence);
		expect(result).toEqual(expected);
	});

	test('handles emojis with multiple modifiers', () => {
		const sentence = '👩🏽‍💻 👨🏼‍🍳';
		const expected = {
			sentence: sentence,
			tokens: ['👩🏽‍💻', '👨🏼‍🍳'],
		};
		const result = tokenizeSentences(sentence);
		expect(result).toEqual(expected);
	});

	test('handles emojis with and without modifiers', () => {
		const sentence = '👋🏻 👋 👩🏽‍💻 👨‍🍳';
		const expected = {
			sentence: sentence,
			tokens: ['👋🏻', '👋', '👩🏽‍💻', '👨‍🍳'],
		};
		const result = tokenizeSentences(sentence);
		expect(result).toEqual(expected);
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
