import emojiRegex from 'emoji-regex';
import {TokenType} from '../lib/types';
import {errors} from '../lib/constants';
import {normalizeString} from './normalizeString';
import {ISentence, IToken} from '../../../lib/types';

const tokenizeSentences = (sentence: string): ISentence => {
	if (typeof sentence !== 'string') {
		throw new TypeError(errors.mustBeString);
	}

	const trimmedSentence = sentence.trim().replace(/\s+/g, ' ');
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
		literalTranslation: '',
		tokens: tokens,
	};
};
export {tokenizeSentences};
