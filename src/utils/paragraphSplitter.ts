/**
 * Splits a string into an array of sentences.
 * @param string - The string to be split into sentences.
 * @returns An array of sentences.
 */
const paragraphSplitter = (string: string): string[] => {
	const sentenceEndRegex = /(\s*\.{3}|\s*[.?!,:;\-])/;
	const sentences: string[] = string.split(sentenceEndRegex);
	const filteredSentences: string[] = [];
	for (let i: number = 0; i < sentences.length; i += 2) {
		const sentence: string = sentences[i].trim();
		const punctuation: string = sentences[i + 1] ? sentences[i + 1].trim() : '';
		const completeSentence: string = sentence + punctuation;
		if (completeSentence) {
			filteredSentences.push(completeSentence);
		}
	}
	return filteredSentences;
};

export {paragraphSplitter};
