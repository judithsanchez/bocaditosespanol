import {paragraphSplitter} from './paragraphSplitter';
import {tokenizeSentences} from './tokenizeSentences';
import {batchProcessor} from './batchProcessor';
import {ISentence, ITextProcessor} from '../lib/types';
import {augmentSentences} from './augmentSentences';
import {errors} from '../lib/constants';

export class TextProcessor implements ITextProcessor {
	private static readonly RATE_LIMITS = {
		REQUESTS_PER_MINUTE: 1,
		BATCH_SIZE: 10,
		DELAY_BETWEEN_BATCHES: 6000,
		RETRY_ATTEMPTS: 3,
	};

	public processedText: ISentence[];

	constructor(public textData: string) {
		if (!textData) {
			throw new Error(errors.invalidTextData);
		}
		this.processedText = [];
	}

	async processTextData(): Promise<ISentence[]> {
		const splittedParagraph = paragraphSplitter(this.textData);
		const tokenizedText: ISentence[] = splittedParagraph.map(sentence =>
			tokenizeSentences(sentence),
		);

		this.processedText = await batchProcessor<ISentence>({
			items: tokenizedText,
			processingFn: augmentSentences,
			batchSize: TextProcessor.RATE_LIMITS.BATCH_SIZE,
			options: {
				retryAttempts: TextProcessor.RATE_LIMITS.RETRY_ATTEMPTS,
				delayBetweenBatches: TextProcessor.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
				maxRequestsPerMinute: TextProcessor.RATE_LIMITS.REQUESTS_PER_MINUTE,
			},
		});

		return this.processedText;
	}
}
