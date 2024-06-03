import {paragraphSplitter} from './paragraphSplitter';
import {tokenizeSentences} from './tokenizeSentences';
import {ISentence} from '../lib/types';
import {errors} from '../lib/constants';

export const processTextData = async (text: string): Promise<ISentence[]> => {
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
};
