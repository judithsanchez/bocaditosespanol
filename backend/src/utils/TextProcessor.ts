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

		console.log('\n📊 Processing Statistics:');
		console.log(
			`Total sentences before deduplication: ${tokenizedText.length}`,
		);

		// Log original sentences
		console.log('\nOriginal sentences:');
		tokenizedText.forEach((s, i) => console.log(`${i + 1}. ${s.sentence}`));

		// Create unique sentences map
		const uniqueSentencesMap = new Map<string, ISentence>();
		tokenizedText.forEach(sentence => {
			if (!uniqueSentencesMap.has(sentence.sentence)) {
				uniqueSentencesMap.set(sentence.sentence, sentence);
			}
		});

		const uniqueSentences = Array.from(uniqueSentencesMap.values());

		// Log duplicate information
		console.log('\nDuplicate sentences:');
		const sentenceCounts = new Map();
		tokenizedText.forEach(s => {
			const count = sentenceCounts.get(s.sentence) || 0;
			sentenceCounts.set(s.sentence, count + 1);
		});

		for (const [sentence, count] of sentenceCounts) {
			if (count > 1) {
				console.log(`"${sentence}" appears ${count} times`);
			}
		}

		console.log(`\nUnique sentences to process: ${uniqueSentences.length}`);
		console.log(
			`Duplicates removed: ${tokenizedText.length - uniqueSentences.length}`,
		);

		// Continue with existing processing...
		const enrichedUniqueSentences = await batchProcessor<ISentence>({
			items: uniqueSentences,
			processingFn: enrichSentencesWithAI,
			batchSize: TextProcessor.RATE_LIMITS.BATCH_SIZE,
			options: {
				retryAttempts: TextProcessor.RATE_LIMITS.RETRY_ATTEMPTS,
				delayBetweenBatches: TextProcessor.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
				maxRequestsPerMinute: TextProcessor.RATE_LIMITS.REQUESTS_PER_MINUTE,
			},
		});

		// Create lookup map of processed results
		const processedSentencesMap = new Map(
			enrichedUniqueSentences.map(enriched => [enriched.sentence, enriched]),
		);

		// Map back to original array preserving order
		this.processedText = tokenizedText.map(
			original => processedSentencesMap.get(original.sentence)!,
		);

		return this.processedText;
	}
}
