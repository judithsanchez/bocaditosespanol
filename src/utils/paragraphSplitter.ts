import {errors} from '../lib/constants';

const paragraphSplitter = (string: string): string[] => {
	if (typeof string !== 'string') {
		throw new TypeError(errors.mustBeString);
	}

	const normalizedString = string.replace(/\s+/g, ' ').replace(/[\n\r]+/g, ' ');

	const sentenceEndRegex: RegExp = /(?:[.!?]|\.{3})(?:\s+|$)/g;
	const sentences: string[] = [];
	let lastIndex = 0;

	for (let match of normalizedString.matchAll(sentenceEndRegex)) {
		if (match.index !== undefined) {
			const sentence = normalizedString
				.slice(lastIndex, match.index + match[0].length)
				.trim();
			if (sentence) {
				sentences.push(sentence);
			}
			lastIndex = match.index + match[0].length;
		}
	}

	const remainingText = normalizedString.slice(lastIndex).trim();
	if (remainingText) {
		sentences.push(remainingText);
	}

	return sentences;
};

export {paragraphSplitter};
