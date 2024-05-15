import {paragraphSplitter} from './paragraphSplitter';
import {normalizeString} from './normalizeString';
import {tokenizeSentences} from './tokenizeSentences';
import {ISentence, ITextProcessor} from '../lib/types';
import {errors} from '../lib/constants';

export class TextProcessor implements ITextProcessor {
	public processedText: ISentence[];

	constructor(public textData: string) {
		if (!textData) {
			throw new Error(errors.invalidData);
		}

		try {
			this.processedText = this.processTextData(textData);
		} catch (error) {
			throw new Error(`Error processing text data: ${error}`);
		}
	}

	processTextData(text: string): ISentence[] {
		if (!text) {
			throw new Error(errors.invalidText);
		}

		try {
			const splittedParagraph = paragraphSplitter(text);
			const normalizedText = splittedParagraph.map(sentence =>
				normalizeString(sentence),
			);
			const tokenizedText: ISentence[] = normalizedText.map(sentence =>
				tokenizeSentences(sentence),
			);
			return tokenizedText;
		} catch (error) {
			throw new Error(`Error processing text data: ${error}`);
		}
	}
}
