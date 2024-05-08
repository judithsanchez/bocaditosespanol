const paragraphSplitter = (string: string): string[] => {
	const sentenceEndRegex: RegExp = /([.!?;])/;
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
