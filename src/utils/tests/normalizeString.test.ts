import {normalizeString} from '@utils/normalizeString';

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

	test('ignores case sensitivity', () => {
		expect(normalizeString('ÁÉÑÜ')).toBe('aenu');
	});

	test('handles leading and trailing spaces', () => {
		expect(normalizeString('  áéñü  ')).toBe('aenu');
	});
});
