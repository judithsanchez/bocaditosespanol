/**
 * Normalizes a string by removing leading/trailing whitespace, converting to lowercase,
 * and replacing accented characters with their non-accented counterparts.
 *
 * @param string - The string to normalize.
 * @throws {TypeError} If the input is not a string.
 * @returns The normalized string.
 */

import {errors} from './lib/constans';

export const normalizeString = (string: string): string => {
	if (typeof string !== 'string') {
		throw new TypeError(errors.mustBeString);
	}
	return string
		.trim()
		.toLowerCase()
		.replace(
			/[áéíóú]/g,
			accentedVowel => 'aeiou'['áéíóú'.indexOf(accentedVowel)],
		)
		.replace(/[ñ]/g, 'n')
		.replace(/[ü]/g, 'u');
};
