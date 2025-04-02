import {Pipeline} from './Pipeline';
import {
	ContentType,
	IEmoji,
	IPunctuationSign,
	ISentence,
	IWord,
	Token,
} from '@/lib/types/common';
import {WriteDatabaseService} from '../services/WriteDatabaseService';
import {
	InputValidatorStep,
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
} from '@/lib/types/contentType';

export interface ContentProcessingPipeline {
	rawInput: AddContentRequest;
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
	content: IContent;
}

export class ContentProcessingPipeline extends Pipeline<ContentProcessingPipeline> {
	private readonly db: WriteDatabaseService;
	protected readonly logger: Logger;

	constructor() {
		const db = new WriteDatabaseService();

		super(
			{
				name: 'ContentProcessing',
				stopOnError: true,
			},
			[
				new InputValidatorStep(),
				new SentenceFormatterStep(),
				new TokenIdentificationStep(db),
				new SentenceAIEnricherSteps(),
				new SentenceLearningInsightsEnricherStep(),
				new SensesEnrichmentStep(),
				new CognateAnalysisStep(),
				new SlangDetectionStep(),
				new GrammaticalEnricherStep(),
			],
		);
		this.db = new WriteDatabaseService();
		this.logger = new Logger('ContentProcessingPipeline');
	}

	static createContext(input: AddContentRequest): ContentProcessingPipeline {
		return {
			rawInput: input,
			sentences: {
				formatted: [],
				deduplicated: [],
				enriched: [],
			},
			tokens: {
				words: [],
				deduplicated: [],
				enriched: [],
				punctuationSigns: [],
				emojis: [],
			},
			content: {} as IContent,
		};
	}

	async processText(
		input: AddContentRequest,
	): Promise<ContentProcessingPipeline> {
		this.logger.start('processText');

		const validationResult = contentRequestSchema.safeParse(input);
		if (!validationResult.success) {
			throw new Error(
				`Invalid content data: ${validationResult.error.message}`,
			);
		}

		// Inline context creation instead of using static method
		const context: ContentProcessingPipeline = {
			rawInput: validationResult.data,
			sentences: {
				formatted: [],
				deduplicated: [],
				enriched: [],
			},
			tokens: {
				words: [],
				deduplicated: [],
				enriched: [],
				punctuationSigns: [],
				emojis: [],
			},
			content: {} as IContent,
		};

		this.logger.info('Context created', {
			contentType: input.contentType,
			title: input.title,
		});

		const processedContext = await this.process(context);
		this.logContextState('After pipeline processing', processedContext);

		// Generate content ID based on content type and relevant fields
		let contentId = '';
		const titleSlug = input.title.toLowerCase().replace(/\s+/g, '-');

		switch (input.contentType) {
			case ContentType.SONG:
				const songInput = input as ContentRequest & {interpreter: string};
				const interpreterSlug = songInput.interpreter
					.toLowerCase()
					.replace(/\s+/g, '-');
				contentId = `song-${titleSlug}-${interpreterSlug}`;
				processedContext.content = {
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
					interpreter: songInput.interpreter,
					feat: songInput.feat || [],
				} as ISong;
				break;

			case ContentType.BOOK_EXCERPT:
				const bookInput = input as ContentRequest & {author: string};
				const authorSlug = bookInput.author.toLowerCase().replace(/\s+/g, '-');
				contentId = `book-${titleSlug}-${authorSlug}`;
				processedContext.content = {
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
					author: bookInput.author,
					pages: bookInput.pages,
					isbn: bookInput.isbn,
				} as IBookExcerpt;
				break;

			case ContentType.VIDEO_TRANSCRIPT:
				const videoInput = input as ContentRequest & {creator: string};
				const creatorSlug = videoInput.creator
					.toLowerCase()
					.replace(/\s+/g, '-');
				contentId = `video-${titleSlug}-${creatorSlug}`;
				processedContext.content = {
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
					creator: videoInput.creator,
					contributors: videoInput.contributors || [],
				} as IVideoTranscript;
				break;
		}

		this.logger.info('Saving to database');
		await this.db.saveSentences(processedContext.sentences.enriched, {
			title: input.title,
			contentType: input.contentType,
		});
		await this.db.saveTextEntry(processedContext.content, input.contentType);
		await this.db.saveTokens([
			...processedContext.tokens.enriched,
			...processedContext.tokens.punctuationSigns,
			...processedContext.tokens.emojis,
		]);

		this.logger.info('Database operations completed');
		this.logger.end('processText');
		return processedContext;
	}

	private logContextState(
		stepName: string,
		context: ContentProcessingPipeline,
	) {
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
