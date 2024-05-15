/**
 * Tokenizes a sentence into an array of strings.
 *
 * A token is a meaningful unit of text, typically a word, an emoji or a punctuation mark,
 * that is obtained by splitting a sentence into smaller pieces.
 * @param sentence - The sentence to be tokenized.
 * @throws {TypeError} If the input is not a string.
 * @throws {Error} If the sentence is empty after trimming.
 * @returns An object containing the original sentence and an array of tokens.
 */
import emojiRegex from 'emoji-regex';
import {ISentence} from '../lib/types';
import {errors} from '../lib/constants';

const tokenizeSentences = (sentence: string): ISentence => {
	if (typeof sentence !== 'string') {
		throw new TypeError(errors.mustBeString);
	}

	const trimmedSentence = sentence.trim();
	if (trimmedSentence === '') {
		throw new Error(errors.cantTokenize);
	}

	const emojiPattern = emojiRegex();
	const pattern = `(${emojiPattern.source}|\\.{3}|[.?!¡¿,:;'"\\s-])`;
	const regex = new RegExp(pattern, 'gu');
	const tokens: string[] = trimmedSentence
		.split(regex)
		.filter(token => token.trim() !== '');
	return {
		sentence: trimmedSentence,
		tokens: tokens,
	};
};

export {tokenizeSentences};
