import {PipelineStep} from '../Pipeline';
import {Logger} from '../../utils/index';
import {SongProcessingContext} from 'pipelines/SongProcessingPipeline';
import {errors} from '../../lib/constants';
import {ISentence} from 'lib/types';

export class SentenceProcessorStep
	implements PipelineStep<SongProcessingContext>
{
	private readonly logger = new Logger('SentenceProcessorStep');

	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');

		context.sentences.raw = this.splitParagraph(context.rawInput.lyrics);

		context.sentences.formatted = this.formatSentences({
			sentences: context.sentences.raw,
			author: context.rawInput.interpreter,
			title: context.rawInput.title,
		});

		context.sentences.originalSentencesIds = context.sentences.formatted.map(
			s => s.sentenceId,
		);

		const seen = new Set();
		context.sentences.deduplicated = context.sentences.formatted.filter(
			sentence => {
				const isDuplicate = seen.has(sentence.content);
				seen.add(sentence.content);
				return !isDuplicate;
			},
		);

		this.logger.info('Sentence processing completed', {
			rawCount: context.sentences.raw.length,
			formattedCount: context.sentences.formatted.length,
			deduplicatedCount: context.sentences.deduplicated.length,
		});

		this.logger.end('process');
		return context;
	}

	private splitParagraph(text: string): string[] {
		if (typeof text !== 'string') {
			throw new TypeError(errors.mustBeString);
		}

		const lowercaseText = text.toLowerCase();

		const normalizedText = lowercaseText
			.replace(/\s+/g, ' ')
			.replace(/[\n\r]+/g, ' ');

		const sentenceEndRegex = /(?:[.!?]|\.{3})(?:\s+|$)/g;
		const sentences: string[] = [];
		let lastIndex = 0;

		for (const match of normalizedText.matchAll(sentenceEndRegex)) {
			if (match.index !== undefined) {
				const sentence = normalizedText
					.slice(lastIndex, match.index + match[0].length)
					.trim();
				if (sentence) {
					sentences.push(sentence);
				}
				lastIndex = match.index + match[0].length;
			}
		}

		const remainingText = normalizedText.slice(lastIndex).trim();
		if (remainingText) {
			sentences.push(remainingText);
		}

		return sentences;
	}

	private formatSentences({
		sentences,
		author,
		title,
	}: {
		sentences: string[];
		author: string;
		title: string;
	}): ISentence[] {
		const sentenceMap = new Map<string, number>();

		return sentences.map(sentence => {
			if (!sentenceMap.has(sentence)) {
				sentenceMap.set(sentence, sentenceMap.size + 1);
			}

			const sentenceNumber = sentenceMap.get(sentence);
			return {
				sentenceId: `sentence-${sentenceNumber}-${title
					.toLowerCase()
					.replace(/\s+/g, '-')}-${author.toLowerCase().replace(/\s+/g, '-')}`,
				content: sentence,
				translations: {
					english: {
						literal: '',
						contextual: '',
					},
				},
				tokenIds: [],
			};
		});
	}
}
