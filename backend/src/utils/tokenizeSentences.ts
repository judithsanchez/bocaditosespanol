import {v4 as uuidv4} from 'uuid';
import emojiRegex from 'emoji-regex';
import {IWord, TokenType} from '../lib/types';
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
			const tokenId = `token-${token}`;

			if (emojiRegex().test(token)) {
				return {
					tokenId,
					content: token,
					type: 'emoji' as TokenType,
				};
			} else if (/^[.?!¡¿,:;'"\\s-]+$/.test(token)) {
				return {
					tokenId,
					content: token,
					type: 'punctuationSign' as TokenType,
				};
			} else {
				const wordContent: IWord = {
					wordId: `word-${normalizeString(token)}`,
					spanish: token,
					normalizedToken: normalizeString(token),
					hasSpecialChar: token.toLowerCase() !== normalizeString(token),
					english: '',
					partOfSpeech: '',
					isSlang: false,
					isCognate: false,
					isFalseCognate: false,
				};

				return {
					tokenId,
					content: wordContent,
					type: 'word' as TokenType,
				};
			}
		});
	return {
		sentenceId: `sentence-${uuidv4()}`,
		sentence: trimmedSentence,
		translation: '',
		literalTranslation: '',
		tokens: tokens,
	};
};

export {tokenizeSentences};
