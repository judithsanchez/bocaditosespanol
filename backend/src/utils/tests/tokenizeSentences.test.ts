import {errors} from 'lib/constants';
import {tokenizeSentences} from '../tokenizeSentences';
import {TokenType} from 'lib/types';
import {tokenizeSentencesFixtures} from './lib/fixtures';

describe('tokenizeSentences', () => {
	test('tokenizes a simple sentence correctly', () => {
		const {input, expected} = tokenizeSentencesFixtures.simpleSentence;
		const result = tokenizeSentences(input);
		expect(result.tokens).toEqual(expected);
	});

	test('tokenizes a sentence with multiple punctuation marks correctly', () => {
		const {input, expected} = tokenizeSentencesFixtures.multiplePunctuation;
		const result = tokenizeSentences(input);
		expect(result.tokens).toEqual(expected);
	});

	test('tokenizes a sentence with emojis correctly', () => {
		const {input, expected} = tokenizeSentencesFixtures.withEmojis;
		const result = tokenizeSentences(input);
		expect(result.tokens).toEqual(expected);
	});

	test('handles emojis with skin tone modifiers', () => {
		const {input, expected} = tokenizeSentencesFixtures.emojiSkinTones;
		const result = tokenizeSentences(input);
		expect(result.tokens).toEqual(expected);
	});

	test.each([
		[123, errors.mustBeString],
		[undefined, errors.mustBeString],
		[null, errors.mustBeString],
		[{}, errors.mustBeString],
		[[], errors.mustBeString],
		[() => {}, errors.mustBeString],
		[Symbol('test'), errors.mustBeString],
		[BigInt(123), errors.mustBeString],
	])('throws error for invalid input: %p', (input, expectedError) => {
		expect(() => tokenizeSentences(input as unknown as string)).toThrow(
			expectedError,
		);
	});
});
