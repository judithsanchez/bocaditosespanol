import {paragraphSplitter} from './paragraphSplitter';
import {tokenizeSentences} from './tokenizeSentences';
import {ISentence, ITextProcessor, TokenType} from '../lib/types';
import {errors} from '../lib/constants';

export class TextProcessor {
	public async ProcessTextData(text: string): Promise<ISentence[]> {
		if (!text) {
			throw new Error(errors.invalidText);
		}

		try {
			const splittedParagraph = paragraphSplitter(text);
			const tokenizedText: Promise<ISentence>[] = splittedParagraph.map(
				async sentence => await tokenizeSentences(sentence),
			);
			return Promise.all(tokenizedText);
		} catch (error) {
			throw new Error(`Error processing text data: ${error}`);
		}
	}
}
