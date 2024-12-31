import {errors} from '../lib/constants';

export const normalizeString = (string: string): string => {
	if (typeof string !== 'string') {
		throw new TypeError(errors.mustBeString);
	}

	return string
		.trim()
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.replace(
			/[áéíóú]/g,
			accentedVowel => 'aeiou'['áéíóú'.indexOf(accentedVowel)],
		)
		.replace(/[ñ]/g, 'n')
		.replace(/[ü]/g, 'u');
};
