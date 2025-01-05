import {splitParagraph} from 'utils/splitParagraph';
import {splitParagraphFixtures} from './lib/fixtures';
import {errors} from 'lib/constants';

describe('splitParagraph', () => {
	test('splits a string into an array of sentences', () => {
		const {input, expected} = splitParagraphFixtures.basicSentences;
		expect(splitParagraph(input)).toEqual(expected);
	});

	test('handles strings with multiple punctuation marks', () => {
		const {input, expected} = splitParagraphFixtures.multiplePunctuation;
		expect(splitParagraph(input)).toEqual(expected);
	});

	test('handles strings with emojis', () => {
		const {input, expected} = splitParagraphFixtures.withEmojis;
		expect(splitParagraph(input)).toEqual(expected);
	});

	test('handles strings with ellipsis', () => {
		const {input, expected} = splitParagraphFixtures.withEllipsis;
		expect(splitParagraph(input)).toEqual(expected);
	});

	test('handles empty strings', () => {
		const {input, expected} = splitParagraphFixtures.empty;
		expect(splitParagraph(input)).toEqual(expected);
	});

	test('handles strings with trailing punctuation', () => {
		const {input, expected} = splitParagraphFixtures.singleSentence;
		expect(splitParagraph(input)).toEqual(expected);
	});

	test('handles strings with multiple sentences and trailing punctuation', () => {
		const {input, expected} = splitParagraphFixtures.multipleSentences;
		expect(splitParagraph(input)).toEqual(expected);
	});

	test('handles Spanish sentences with opening/closing punctuation', () => {
		const {input, expected} = splitParagraphFixtures.spanishSentences;
		expect(splitParagraph(input)).toEqual(expected);
	});

	test('handles sentences with Spanish special characters', () => {
		const {input, expected} = splitParagraphFixtures.specialCharacters;
		expect(splitParagraph(input)).toEqual(expected);
	});

	test('handles text with line breaks', () => {
		const {input, expected} = splitParagraphFixtures.lineBreaks;
		expect(splitParagraph(input)).toEqual(expected);
	});

	test('handles mixed Spanish punctuation patterns', () => {
		const {input, expected} = splitParagraphFixtures.mixedPunctuation;
		expect(splitParagraph(input)).toEqual(expected);
	});

	test('handles Spanish accents and diacritical marks', () => {
		const {input, expected} = splitParagraphFixtures.accentsAndDiacritics;
		expect(splitParagraph(input)).toEqual(expected);
	});

	test('normalizes multiple spaces between sentences', () => {
		const {input, expected} = splitParagraphFixtures.multipleSpaces;
		expect(splitParagraph(input)).toEqual(expected);
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
		expect(() => splitParagraph(input as unknown as string)).toThrow(
			expectedError,
		);
	});
});
