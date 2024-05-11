/**
 * Tokenizes a sentence into an array of strings.
 *
 * A token is a meaningful unit of text, typically a word, an emoji or a punctuation mark,
 * that is obtained by splitting a sentence into smaller pieces.
 * @param sentence - The sentence to be tokenized.
 * @returns An object containing the original sentence and an array of tokens, or `null` if the sentence is empty.
 */
import emojiRegex from 'emoji-regex';

interface ISentence {
	originalSentence: string;
	tokens: string[];
}

const tokenizeSentences = (sentence: string): ISentence | null => {
	const emojiPattern = emojiRegex();
	const pattern = `(${emojiPattern.source}|\\.{3}|[.?!¡¿,:;'"\\s-])`;
	const regex = new RegExp(pattern, 'gu');
	const tokens: string[] = sentence
		.split(regex)
		.filter(token => token.trim() !== '');
	if (tokens.length > 0) {
		return {
			originalSentence: sentence,
			tokens: tokens,
		};
	} else {
		return null;
	}
};

export {tokenizeSentences};
