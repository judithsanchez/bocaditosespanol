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
