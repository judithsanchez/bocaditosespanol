import {PipelineStep} from '../Pipeline';
import {Logger} from '../../utils/index';
import {ContentProcessingContext} from '@/lib/pipelines/ContentProcessingPipeline';
import {errors} from '@/lib/types/constants';
import {z} from 'zod';
import {ISentence, sentenceSchema} from '@/lib/types/sentence';

const formattedSentencesSchema = z.array(sentenceSchema);

export class SentenceFormatterStep
	implements PipelineStep<ContentProcessingContext>
{
	private readonly logger = new Logger('SentenceFormatterStep');
	private static readonly SENTENCE_END_PATTERN = /(?:[.!?]|\.{3})(?:\s+|$)/g;
	private static readonly WHITESPACE_PATTERN = /\s+/g;
	private static readonly NEWLINE_PATTERN = /[\n\r]+/g;

	async process(
		context: ContentProcessingContext,
	): Promise<ContentProcessingContext> {
		this.logger.start('process');

		const validatedLyrics = this.validateInput(context.input.content);
		const splittedSentences = this.splitParagraph(validatedLyrics);

		this.logSplitResults(splittedSentences);

		context.sentences.formatted = this.formatSentences({
			sentences: splittedSentences,
			contributor: context.input.contributors.main,
			title: context.input.title,
		});

		this.validateFormattedSentences(context.sentences.formatted);
		context.sentences.deduplicated = this.deduplicateSentences(
			context.sentences.formatted,
		);

		this.logFormattingResults(context.sentences);

		this.logger.end('process');
		return context;
	}
	private validateInput(content: string): string {
		if (typeof content !== 'string') {
			throw new TypeError(errors.mustBeString);
		}
		return content;
	}

	private validateFormattedSentences(sentences: ISentence[]): void {
		const result = formattedSentencesSchema.safeParse(sentences);
		if (!result.success) {
			throw new Error(
				`Sentence formatting validation failed: ${result.error.format()}`,
			);
		}
	}

	private splitParagraph(text: string): string[] {
		if (typeof text !== 'string') {
			throw new TypeError(errors.mustBeString);
		}

		const normalizedText = this.normalizeText(text);
		return this.extractSentences(normalizedText);
	}

	private normalizeText(text: string): string {
		return text
			.toLowerCase()
			.replace(SentenceFormatterStep.WHITESPACE_PATTERN, ' ')
			.replace(SentenceFormatterStep.NEWLINE_PATTERN, ' ');
	}

	private extractSentences(normalizedText: string): string[] {
		const sentences: string[] = [];
		let lastIndex = 0;

		for (const match of normalizedText.matchAll(
			SentenceFormatterStep.SENTENCE_END_PATTERN,
		)) {
			if (match.index !== undefined) {
				const sentence = this.extractSentence(normalizedText, lastIndex, match);
				if (sentence) sentences.push(sentence);
				lastIndex = match.index + match[0].length;
			}
		}

		const remainingText = normalizedText.slice(lastIndex).trim();
		if (remainingText) {
			sentences.push(remainingText);
		}

		return sentences;
	}

	private extractSentence(
		text: string,
		startIndex: number,
		match: RegExpMatchArray,
	): string {
		return text.slice(startIndex, match.index! + match[0].length).trim();
	}

	private formatSentences({
		sentences,
		contributor,
		title,
	}: {
		sentences: string[];
		contributor: string;
		title: string;
	}): ISentence[] {
		const sentenceMap = new Map<string, number>();

		return sentences.map(sentence => {
			if (!sentenceMap.has(sentence)) {
				sentenceMap.set(sentence, sentenceMap.size + 1);
			}

			return this.createSentence(
				sentence,
				sentenceMap.get(sentence)!,
				title,
				contributor,
			);
		});
	}

	private createSentence(
		content: string,
		number: number,
		title: string,
		contributor: string,
	): ISentence {
		return {
			sentenceId: this.generateSentenceId(number, title, contributor),
			content,
			translations: {
				english: {
					literal: '',
					contextual: '',
				},
			},
			tokenIds: [],
		};
	}

	private generateSentenceId(
		sentenceNumber: number,
		title: string,
		contributor: string,
	): string {
		return `sentence-${sentenceNumber}-${this.slugify(title)}-${this.slugify(
			contributor,
		)}`;
	}

	private slugify(text: string): string {
		return text
			.toLowerCase()
			.replace(SentenceFormatterStep.WHITESPACE_PATTERN, '-');
	}

	private deduplicateSentences(sentences: ISentence[]): ISentence[] {
		const seen = new Set();
		return sentences.filter(sentence => {
			const isDuplicate = seen.has(sentence.content);
			seen.add(sentence.content);
			return !isDuplicate;
		});
	}

	private logSplitResults(sentences: string[]): void {
		this.logger.info('Sentences split', {
			firstSentence: sentences[0],
			lastSentence: sentences[sentences.length - 1],
		});
	}

	private logFormattingResults(sentences: {
		formatted: ISentence[];
		deduplicated: ISentence[];
	}): void {
		this.logger.info('Formatting completed', {
			formatted: sentences.formatted.length,
			deduplicated: sentences.deduplicated.length,
		});
	}
}
