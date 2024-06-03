/**
 * Tokenizes a sentence into an array of tokens.
 *
 * A token can be a word, an emoji, or a punctuation sign. Each token is represented
 * as an object with properties `token` and `type`.
 *
 * For words, the `token` property is an object with the following properties:
 * - `spanish`: The original word in Spanish.
 * - `normalizedToken`: The word in its normalized form (lowercase, without accents).
 * - `hasSpecialChar`: A boolean indicating whether the original word contained special characters.
 *
 * For emojis and punctuation signs, the `token` property is a string representing the emoji or punctuation sign.
 *
 * The `type` property indicates the type of the token (word, emoji, or punctuation sign).
 *
 * @param sentence - The sentence to be tokenized.
 * @throws {TypeError} If the input is not a string.
 * @throws {Error} If the sentence is empty after trimming.
 * @returns An object containing the original sentence and an array of tokens.
 */

import emojiRegex from 'emoji-regex';
import {ISentence, IToken, TokenType} from '../lib/types';
import {errors} from '../lib/constants';
import {normalizeString} from './normalizeString';
import {getEnglishTranslation, getWordType} from './aiLyricsProcessor';

const tokenizeSentences = async (sentence: string): Promise<ISentence> => {
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

	const tokens: IToken[] = await Promise.all(
		trimmedSentence
			.split(regex)
			.filter(token => token.trim() !== '')
			.map(async token => {
				if (emojiRegex().test(token)) {
					return {token, type: TokenType.Emoji};
				} else if (/^[.?!¡¿,:;'"\\s-]+$/.test(token)) {
					return {token, type: TokenType.PunctuationSign};
				} else {
					const spanish = token;
					const normalizedToken = normalizeString(spanish);
					const hasSpecialChar = spanish.toLowerCase() !== normalizedToken;
					const english = await getEnglishTranslation(sentence, spanish);
					const type = await getWordType(sentence, spanish);

					const obj = {
						token: {spanish, normalizedToken, hasSpecialChar, english, type},
						type: TokenType.Word,
					};
					return obj;
				}
			}),
	);

	return {
		sentence: trimmedSentence,
		tokens: tokens,
	};
};

export {tokenizeSentences};
