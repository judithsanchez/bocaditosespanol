import {normalizeString} from 'utils/normalizeString';
import {errors} from 'utils//lib/constans';

describe('normalizeString', () => {
	test('replaces accented vowels with unaccented vowels', () => {
		expect(normalizeString('áéíóú')).toBe('aeiou');
	});

	test('replaces ñ with n', () => {
		expect(normalizeString('mañana')).toBe('manana');
	});

	test('replaces ü with u', () => {
		expect(normalizeString('über')).toBe('uber');
	});

	test('replaces Ü with U', () => {
		expect(normalizeString('über')).toBe('uber');
	});

	test('replaces É with E', () => {
		expect(normalizeString('über')).toBe('uber');
	});

	test('handles strings with no special characters', () => {
		expect(normalizeString('hello')).toBe('hello');
	});

	test('handles empty strings', () => {
		expect(normalizeString('')).toBe('');
	});

	test('handles strings with multiple special characters', () => {
		expect(normalizeString('áñü')).toBe('anu');
	});

	test('handles strings with special characters and regular letters', () => {
		expect(normalizeString('áéñü')).toBe('aenu');
	});

	test('handles leading and trailing spaces', () => {
		expect(normalizeString('  áéñü  ')).toBe('aenu');
	});

	test('throws an error when input is not a string', () => {
		expect(() => normalizeString(123 as unknown as string)).toThrow(
			errors.mustBeString,
		);
		expect(() => normalizeString(null as unknown as string)).toThrow(
			errors.mustBeString,
		);
		expect(() => normalizeString(undefined as unknown as string)).toThrow(
			errors.mustBeString,
		);
	});
});
