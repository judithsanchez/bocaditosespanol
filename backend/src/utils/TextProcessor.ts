import {paragraphSplitter} from './paragraphSplitter';
import {tokenizeSentences} from './tokenizeSentences';
import {batchProcessor} from './batchProcessor';
import {ITextProcessor} from '../lib/types';
import {enrichSentencesWithAI} from './enrichSentencesWithAI';
import {errors} from '../lib/constants';
import {ISentence} from '../../../lib/types';

export class TextProcessor implements ITextProcessor {
	private static readonly RATE_LIMITS = {
		REQUESTS_PER_MINUTE: 1,
		BATCH_SIZE: 10,
		DELAY_BETWEEN_BATCHES: 6000,
		RETRY_ATTEMPTS: 3,
	};

	public formattedSentences: ISentence[] = [];
	public enrichedSentences: ISentence[] = [];
	public processedText: ISentence[] = [];

	constructor(public textData: string) {
		if (!textData) {
			throw new Error(errors.invalidTextData);
		}
	}

	private formatSentences(text: string): ISentence[] {
		const splittedParagraph = paragraphSplitter(text);
		return splittedParagraph.map(sentence => tokenizeSentences(sentence));
	}

	private async enrichSentences(
		uniqueSentences: ISentence[],
	): Promise<ISentence[]> {
		const enrichedSentences = await batchProcessor<ISentence>({
			items: uniqueSentences,
			processingFn: enrichSentencesWithAI,
			batchSize: TextProcessor.RATE_LIMITS.BATCH_SIZE,
			options: {
				retryAttempts: TextProcessor.RATE_LIMITS.RETRY_ATTEMPTS,
				delayBetweenBatches: TextProcessor.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
				maxRequestsPerMinute: TextProcessor.RATE_LIMITS.REQUESTS_PER_MINUTE,
			},
		});

		return enrichedSentences;
	}

	public async processText(): Promise<ISentence[]> {
		this.formattedSentences = this.formatSentences(this.textData);

		this.processedText = await this.enrichSentences(this.formattedSentences);

		return this.processedText;
	}
}
