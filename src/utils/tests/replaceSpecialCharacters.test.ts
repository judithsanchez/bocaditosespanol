import {replaceSpecialCharacters} from '../replaceSpecialCharacters';

describe('replaceSpecialCharacters', () => {
	test('replaces accented vowels with unaccented vowels', () => {
		expect(replaceSpecialCharacters('áéíóú')).toBe('aeiou');
	});

	test('replaces ñ with n', () => {
		expect(replaceSpecialCharacters('mañana')).toBe('manana');
	});

	test('replaces ü with u', () => {
		expect(replaceSpecialCharacters('über')).toBe('uber');
	});

	test('handles strings with no special characters', () => {
		expect(replaceSpecialCharacters('hello')).toBe('hello');
	});

	test('handles empty strings', () => {
		expect(replaceSpecialCharacters('')).toBe('');
	});

	test('handles strings with multiple special characters', () => {
		expect(replaceSpecialCharacters('áñü')).toBe('anu');
	});

	test('handles strings with special characters and regular letters', () => {
		expect(replaceSpecialCharacters('áéñü')).toBe('aenu');
	});

	test('ignores case sensitivity', () => {
		expect(replaceSpecialCharacters('ÁÉÑÜ')).toBe('aenu');
	});

	test('handles leading and trailing spaces', () => {
		expect(replaceSpecialCharacters('  áéñü  ')).toBe('aenu');
	});
});
