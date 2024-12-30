import {paragraphSplitter} from 'utils/paragraphSplitter';
import {paragraphSplitterFixtures} from './fixtures';
import {errors} from 'lib/constants';

describe('paragraphSplitter', () => {
	test('splits a string into an array of sentences', () => {
		const {input, expected} = paragraphSplitterFixtures.basicSentences;
		expect(paragraphSplitter(input)).toEqual(expected);
	});

	test('handles strings with multiple punctuation marks', () => {
		const {input, expected} = paragraphSplitterFixtures.multiplePunctuation;
		expect(paragraphSplitter(input)).toEqual(expected);
	});

	test('handles strings with emojis', () => {
		const {input, expected} = paragraphSplitterFixtures.withEmojis;
		expect(paragraphSplitter(input)).toEqual(expected);
	});

	test('handles strings with ellipsis', () => {
		const {input, expected} = paragraphSplitterFixtures.withEllipsis;
		expect(paragraphSplitter(input)).toEqual(expected);
	});

	test('handles empty strings', () => {
		const {input, expected} = paragraphSplitterFixtures.empty;
		expect(paragraphSplitter(input)).toEqual(expected);
	});

	test('handles strings with trailing punctuation', () => {
		const {input, expected} = paragraphSplitterFixtures.singleSentence;
		expect(paragraphSplitter(input)).toEqual(expected);
	});

	test('handles strings with multiple sentences and trailing punctuation', () => {
		const {input, expected} = paragraphSplitterFixtures.multipleSentences;
		expect(paragraphSplitter(input)).toEqual(expected);
	});

	test('handles Spanish sentences with opening/closing punctuation', () => {
		const {input, expected} = paragraphSplitterFixtures.spanishSentences;
		expect(paragraphSplitter(input)).toEqual(expected);
	});

	test('handles sentences with Spanish special characters', () => {
		const {input, expected} = paragraphSplitterFixtures.specialCharacters;
		expect(paragraphSplitter(input)).toEqual(expected);
	});

	test('handles text with line breaks', () => {
		const {input, expected} = paragraphSplitterFixtures.lineBreaks;
		expect(paragraphSplitter(input)).toEqual(expected);
	});

	test('handles mixed Spanish punctuation patterns', () => {
		const {input, expected} = paragraphSplitterFixtures.mixedPunctuation;
		expect(paragraphSplitter(input)).toEqual(expected);
	});

	test('handles Spanish accents and diacritical marks', () => {
		const {input, expected} = paragraphSplitterFixtures.accentsAndDiacritics;
		expect(paragraphSplitter(input)).toEqual(expected);
	});

	test('normalizes multiple spaces between sentences', () => {
		const {input, expected} = paragraphSplitterFixtures.multipleSpaces;
		expect(paragraphSplitter(input)).toEqual(expected);
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
		expect(() => paragraphSplitter(input as unknown as string)).toThrow(
			expectedError,
		);
	});
});
