/**
 * Normalizes a string by removing leading/trailing whitespace, converting to lowercase,
 * and replacing accented characters with their non-accented counterparts.
 *
 * @param string - The string to normalize.
 * @returns The normalized string.
 */
export const normalizeString = (string: string): string => {
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
