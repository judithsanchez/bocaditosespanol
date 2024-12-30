import {normalizeString} from 'utils/normalizeString';
import {normalizeStringFixtures} from './fixtures';
import {errors} from 'lib/constants';

describe('normalizeString', () => {
	test('replaces accented vowels with unaccented vowels', () => {
		const {input, expected} = normalizeStringFixtures.accentedVowels;
		expect(normalizeString(input)).toBe(expected);
	});

	test('replaces ñ with n', () => {
		const {input, expected} = normalizeStringFixtures.spanishN;
		expect(normalizeString(input)).toBe(expected);
	});

	test('replaces ü with u', () => {
		const {input, expected} = normalizeStringFixtures.lowerUmlaut;
		expect(normalizeString(input)).toBe(expected);
	});

	test('replaces Ü with u', () => {
		const {input, expected} = normalizeStringFixtures.upperUmlaut;
		expect(normalizeString(input)).toBe(expected);
	});

	test('replaces É with e', () => {
		const {input, expected} = normalizeStringFixtures.upperAccent;
		expect(normalizeString(input)).toBe(expected);
	});

	test('handles strings with no special characters', () => {
		const {input, expected} = normalizeStringFixtures.noSpecialChars;
		expect(normalizeString(input)).toBe(expected);
	});

	test('handles empty strings', () => {
		const {input, expected} = normalizeStringFixtures.empty;
		expect(normalizeString(input)).toBe(expected);
	});

	test('handles strings with multiple special characters', () => {
		const {input, expected} = normalizeStringFixtures.multipleSpecialChars;
		expect(normalizeString(input)).toBe(expected);
	});

	test('handles strings with special characters and regular letters', () => {
		const {input, expected} = normalizeStringFixtures.mixedChars;
		expect(normalizeString(input)).toBe(expected);
	});

	test('handles leading and trailing spaces', () => {
		const {input, expected} = normalizeStringFixtures.withSpaces;
		expect(normalizeString(input)).toBe(expected);
	});

	test('preserves single spaces between words while trimming', () => {
		const {input, expected} = normalizeStringFixtures.irregularWhitespace;
		expect(normalizeString(input)).toBe(expected);
	});

	test('normalizes multiple spaces to single space', () => {
		const {input, expected} = normalizeStringFixtures.multipleSpaces;
		expect(normalizeString(input)).toBe(expected);
	});

	test('handles tabs and newlines', () => {
		const {input, expected} = normalizeStringFixtures.tabsAndNewlines;
		expect(normalizeString(input)).toBe(expected);
	});

	test.each([
		[123, errors.mustBeString],
		[null, errors.mustBeString],
		[undefined, errors.mustBeString],
	])('throws an error when input is not a string', (input, expectedError) => {
		expect(() => normalizeString(input as unknown as string)).toThrow(
			expectedError,
		);
	});
});
