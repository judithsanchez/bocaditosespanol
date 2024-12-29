import emojiRegex from 'emoji-regex';
import {ISentence, IToken, TokenType} from '../lib/types';
import {errors} from '../lib/constants';
import {normalizeString} from './normalizeString';

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

	const tokens: IToken[] = trimmedSentence
		.split(regex)
		.filter(token => token.trim() !== '')
		.map(token => {
			if (emojiRegex().test(token)) {
				return {token, type: 'emoji' as TokenType};
			} else if (/^[.?!¡¿,:;'"\\s-]+$/.test(token)) {
				return {token, type: 'punctuationSign' as TokenType};
			} else {
				const spanish = token;
				const normalizedToken = normalizeString(spanish);
				const hasSpecialChar = spanish.toLowerCase() !== normalizedToken;
				const english = '';
				const wordType = '';

				return {
					token: {spanish, normalizedToken, hasSpecialChar, english, wordType},
					type: 'word' as TokenType,
				};
			}
		});

	return {
		sentence: trimmedSentence,
		translation: '',
		tokens: tokens,
	};
};

export {tokenizeSentences};
