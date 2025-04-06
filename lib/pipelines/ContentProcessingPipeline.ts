import {Pipeline} from './Pipeline';

import {WriteDatabaseService} from '../services/WriteDatabaseService';
import {
	SentenceFormatterStep,
	SentenceAIEnricherSteps,
	TokenIdentificationStep,
	GrammaticalEnricherStep,
	SensesEnrichmentStep,
	CognateAnalysisStep,
	SlangDetectionStep,
} from './steps/index';
import {Logger} from '../utils/index';
import {SentenceLearningInsightsEnricherStep} from './steps/SentenceLearningInsightsEnricherStep';
import {
	ISong,
	IBookExcerpt,
	IVideoTranscript,
	IContent,
	ContentRequest,
	contentRequestSchema,
	AddContentRequest,
	ContentType,
	SongRequest,
	BookExcerptRequest,
	VideoTranscriptRequest,
} from '@/lib/types/content';
import {ISentence} from '../types/sentence';
import {IEmoji, IPunctuationSign, IWord, Token} from '../types/token';

export interface ContentProcessingContext {
	input: AddContentRequest;
	sentences: {
		formatted: ISentence[];
		deduplicated: ISentence[];
		enriched: ISentence[];
	};
	tokens: {
		words: IWord[];
		punctuationSigns: IPunctuationSign[];
		emojis: IEmoji[];
		deduplicated: Token[];
		enriched: Token[];
	};
	content?: IContent;
	contentType?: ContentType;
}

export class ContentProcessingPipeline extends Pipeline<ContentProcessingContext> {
	private readonly writeDB: WriteDatabaseService;
	protected readonly logger: Logger;

	constructor(input: AddContentRequest) {
		const writeDB = new WriteDatabaseService();

		const context: ContentProcessingContext = {
			input: input,
			sentences: {
				formatted: [],
				deduplicated: [],
				enriched: [],
			},
			tokens: {
				words: [],
				punctuationSigns: [],
				emojis: [],
				deduplicated: [],
				enriched: [],
			},
			contentType: input.contentType,
		};

		super(
			{
				name: 'ContentProcessing',
				stopOnError: true,
			},
			context,
			[
				new SentenceFormatterStep(),
				new TokenIdentificationStep(writeDB),
				new SentenceAIEnricherSteps(),
				new SentenceLearningInsightsEnricherStep(),
				new SensesEnrichmentStep(),
				new CognateAnalysisStep(),
				new SlangDetectionStep(),
				new GrammaticalEnricherStep(),
			],
		);
		this.writeDB = writeDB;
		this.logger = new Logger('ContentProcessingPipeline');
	}

	async processText(): Promise<ContentProcessingContext> {
		this.logger.start('processText');
		const context = this.initialInput;
		const input = context.input;

		const validationResult = contentRequestSchema.safeParse(input);
		if (!validationResult.success) {
			throw new Error(
				`Invalid content data: ${validationResult.error.message}`,
			);
		}

		this.logger.info('Context created', {
			contentType: input.contentType,
			title: input.title,
		});

		const processedContext = await this.process();
		this.logContextState('After pipeline processing', processedContext);

		let contentId = '';
		const titleSlug = input.title.toLowerCase().replace(/\s+/g, '-');

		switch (input.contentType) {
			case ContentType.SONG: {
				const songInput = input as SongRequest;
				const interpreterSlug = songInput.contributors.main
					.toLowerCase()
					.replace(/\s+/g, '-');
				contentId = `song-${titleSlug}-${interpreterSlug}`;
				const songContent: ISong = {
					contentType: ContentType.SONG,
					contentId,
					title: input.title,
					content: input.content,
					processedContent: processedContext.sentences.enriched,
					sentencesIds: processedContext.sentences.formatted.map(
						s => s.sentenceId,
					),
					language: input.language,
					createdAt: Date.now(),
					updatedAt: Date.now(),
					genre: input.genre,
					source: input.source,
					interpreter: songInput.contributors.main,
					feat: songInput.contributors.collaborators || [],
				};
				processedContext.content = songContent;
				processedContext.contentType = ContentType.SONG;
				break;
			}

			case ContentType.BOOK_EXCERPT: {
				const bookInput = input as BookExcerptRequest;
				const authorSlug = bookInput.contributors.main
					.toLowerCase()
					.replace(/\s+/g, '-');
				contentId = `book-${titleSlug}-${authorSlug}`;
				const bookContent: IBookExcerpt = {
					contentType: ContentType.BOOK_EXCERPT,
					contentId,
					title: input.title,
					content: input.content,
					processedContent: processedContext.sentences.enriched,
					sentencesIds: processedContext.sentences.formatted.map(
						s => s.sentenceId,
					),
					language: input.language,
					createdAt: Date.now(),
					updatedAt: Date.now(),
					genre: input.genre,
					source: input.source,
					author: bookInput.contributors.main,
					pages: bookInput.pages,
					isbn: bookInput.isbn,
				};
				processedContext.content = bookContent;
				processedContext.contentType = ContentType.BOOK_EXCERPT;
				break;
			}

			case ContentType.VIDEO_TRANSCRIPT: {
				const videoInput = input as VideoTranscriptRequest;
				const creatorSlug = videoInput.contributors.main
					.toLowerCase()
					.replace(/\s+/g, '-');
				contentId = `video-${titleSlug}-${creatorSlug}`;
				const videoContent: IVideoTranscript = {
					contentType: ContentType.VIDEO_TRANSCRIPT,
					contentId,
					title: input.title,
					content: input.content,
					processedContent: processedContext.sentences.enriched,
					sentencesIds: processedContext.sentences.formatted.map(
						s => s.sentenceId,
					),
					language: input.language,
					createdAt: Date.now(),
					updatedAt: Date.now(),
					genre: input.genre,
					source: input.source,
					creator: videoInput.contributors.main,
					contributors: videoInput.contributors.collaborators || [],
				};
				processedContext.content = videoContent;
				processedContext.contentType = ContentType.VIDEO_TRANSCRIPT;
				break;
			}
		}

		this.logger.info('Saving to database');

		if (!processedContext.content) {
			throw new Error('Content was not properly created during processing');
		}

		await this.writeDB.saveSentences(processedContext.sentences.enriched, {
			title: input.title,
			contentType: processedContext.content.contentType,
		});

		await this.writeDB.saveTextEntry(
			processedContext.content,
			processedContext.contentType,
		);

		await this.writeDB.saveTokens([
			...processedContext.tokens.enriched,
			...processedContext.tokens.punctuationSigns,
			...processedContext.tokens.emojis,
		]);

		this.logger.info('Database operations completed');
		this.logger.end('processText');
		return processedContext;
	}

	private logContextState(stepName: string, context: ContentProcessingContext) {
		this.logger.info(`${stepName} - Context State`, {
			sentences: {
				formatted: {
					length: context.sentences.formatted.length,
					first: context.sentences.formatted[0],
					last: context.sentences.formatted[
						context.sentences.formatted.length - 1
					],
				},
				deduplicated: {
					length: context.sentences.deduplicated.length,
				},
				enriched: {
					length: context.sentences.enriched.length,
				},
			},
			tokens: {
				words: context.tokens.words.length,
				deduplicated: context.tokens.deduplicated.length,
				enriched: context.tokens.enriched.length,
			},
		});
	}
}
