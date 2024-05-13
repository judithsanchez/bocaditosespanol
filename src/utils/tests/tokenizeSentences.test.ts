import {tokenizeSentences} from '../tokenizeSentences';

describe('tokenizeSentences', () => {
	test('returns null for an empty string', () => {
		const sentence = '';
		const result = tokenizeSentences(sentence);
		expect(result).toBeNull();
	});

	test('tokenizes a simple sentence correctly', () => {
		const sentence = 'Hello, world!';
		const expected = {
			originalSentence: sentence,
			tokens: ['Hello', ',', 'world', '!'],
		};
		const result = tokenizeSentences(sentence);
		expect(result).toEqual(expected);
	});

	test('tokenizes a sentence with multiple punctuation marks correctly', () => {
		const sentence = 'Hello, world! How are you?';
		const expected = {
			originalSentence: sentence,
			tokens: ['Hello', ',', 'world', '!', 'How', 'are', 'you', '?'],
		};
		const result = tokenizeSentences(sentence);
		expect(result).toEqual(expected);
	});

	test('tokenizes a sentence with emojis correctly', () => {
		const sentence = 'Hello 👋🏻, world! 😀';
		const expected = {
			originalSentence: sentence,
			tokens: ['Hello', '👋🏻', ',', 'world', '!', '😀'],
		};
		const result = tokenizeSentences(sentence);
		expect(result).toEqual(expected);
	});

	test('tokenizes a sentence with ellipsis correctly', () => {
		const sentence = 'Hello... world!';
		const expected = {
			originalSentence: sentence,
			tokens: ['Hello', '...', 'world', '!'],
		};
		const result = tokenizeSentences(sentence);
		expect(result).toEqual(expected);
	});

	test('handles emojis with skin tone modifiers', () => {
		const sentence = '👋🏻 👋🏼 👋🏽 👋🏾 👋🏿';
		const expected = {
			originalSentence: sentence,
			tokens: ['👋🏻', '👋🏼', '👋🏽', '👋🏾', '👋🏿'],
		};
		const result = tokenizeSentences(sentence);
		expect(result).toEqual(expected);
	});

	test('handles emojis with gender modifiers', () => {
		const sentence = '👨‍💻 👩‍💻';
		const expected = {
			originalSentence: sentence,
			tokens: ['👨‍💻', '👩‍💻'],
		};
		const result = tokenizeSentences(sentence);
		expect(result).toEqual(expected);
	});

	// test('handles emojis with multiple modifiers', () => {
	// 	expect(tokenizeSentences('👩🏽‍💻 👨🏼‍🍳')).toBe('👩‍💻👨‍🍳');
	// });

	// test('handles emojis with and without modifiers', () => {
	// 	expect(tokenizeSentences('👋🏻 👋 👩🏽‍💻 👨‍🍳')).toBe('👋👋👩‍💻👨‍🍳');
	// });
	test('handles emojis with multiple modifiers', () => {
		const sentence = '👩🏽‍💻 👨🏼‍🍳';
		const expected = {
			originalSentence: sentence,
			tokens: ['👩🏽‍💻', '👨🏼‍🍳'],
		};
		const result = tokenizeSentences(sentence);
		expect(result).toEqual(expected);
	});

	test('handles emojis with and without modifiers', () => {
		const sentence = '👋🏻 👋 👩🏽‍💻 👨‍🍳';
		const expected = {
			originalSentence: sentence,
			tokens: ['👋🏻', '👋', '👩🏽‍💻', '👨‍🍳'],
		};
		const result = tokenizeSentences(sentence);
		expect(result).toEqual(expected);
	});
});
