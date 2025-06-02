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
	// Old types commented out, new types imported
	// ISong,
	// IBookExcerpt,
	// IVideoTranscript,
	// IContent,
	// contentRequestSchema, // Renamed to newContentRequestSchema
	// SongRequest, // Old
	// BookExcerptRequest, // Old
	// VideoTranscriptRequest, // Old
	AddContentRequest, // This should be the correct type for input from newContentRequestSchema
	ContentType,
	newContentRequestSchema, // Renamed from contentRequestSchema
	SongContent,
	BookExcerptContent,
	VideoTranscriptContent,
	ProcessedContent, // Base for new content structure
	SongMetadata, // For constructing metadata
	BookMetadata,
	VideoMetadata,
	ContentMetadata, // Union of metadata types
} from '@/lib/types/content';
import {ISentence} from '../types/sentence'; // ISentence should now include processingState and analysisResults
// IEmoji, IPunctuationSign, IWord are old direct interfaces. Token is the new union type.
// The specific token types like EmojiToken, WordToken are now interfaces extending BaseToken.
import {Token, WordToken, PunctuationToken, EmojiToken} from '../types/token'; // Token should be the new union type
import {ProcessingStage} from '@/lib/types/processing'; // Import ProcessingStage for finalization

export interface ContentProcessingContext {
	input: AddContentRequest; // This uses the new AddContentRequest from newContentRequestSchema
	sentences: {
		formatted: ISentence[]; // ISentence now includes processingState and analysisResults
		deduplicated: ISentence[];
		enriched: ISentence[];
	};
	tokens: {
		// Replace IWord, IPunctuationSign, IEmoji with their new interface counterparts
		// or simply use the Token union type if specific arrays are not needed.
		// For now, let's assume enriched tokens are of type Token (the new union type).
		// The specific arrays words, punctuationSigns, emojis might be for intermediate steps.
		// If these steps now produce objects conforming to WordToken, PunctuationToken, EmojiToken,
		// then these types should be used.
		words: WordToken[]; // Assuming TokenIdentificationStep now produces WordToken
		punctuationSigns: PunctuationToken[]; // Assuming PunctuationToken
		emojis: EmojiToken[]; // Assuming EmojiToken
		deduplicated: Token[]; // Token is the new union type
		enriched: Token[]; // Token is the new union type
	};
	content?: ProcessedContent & {metadata: ContentMetadata}; // Using new combined structure
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
		let currentContext = this.initialInput; // Use a mutable variable for context

		try {
			const input = currentContext.input;

			// Use newContentRequestSchema for validation
			const validationResult = newContentRequestSchema.safeParse(input);
			if (!validationResult.success) {
				throw new Error(
					`Invalid content data: ${validationResult.error.message}`,
				);
			}
			// After successful parsing, 'input' is confirmed to be AddContentRequest.
			// The specific fields like 'interpreter' (for songs) are directly on AddContentRequest.

			this.logger.info('Context created', {
				contentType: input.contentType,
				title: input.title,
			});

			const processedContext = await this.process();
			this.logContextState('After pipeline processing', processedContext);

			// Finalize processing states before constructing content for saving
			const now = Date.now();
			processedContext.sentences.enriched.forEach(sentence => {
				sentence.processingState = {
					...sentence.processingState, // Keep previous startedAt, error if any
					stage: ProcessingStage.FINALIZED,
					completedAt: now,
				};
			});
			processedContext.tokens.enriched.forEach(token => {
				token.processingState = {
					...token.processingState, // Keep previous startedAt, error if any
					stage: ProcessingStage.FINALIZED,
					completedAt: now,
				};
			});

			let contentId = '';
			const titleSlug = input.title.toLowerCase().replace(/\s+/g, '-');

			// Base data for all content types, conforming to ProcessedContent
			const baseContentData: Omit<
				ProcessedContent,
				'contentId' | 'updatedAt' | 'metadata'
			> = {
				contentType: input.contentType,
				title: input.title,
				content: input.content,
				processedSentences: processedContext.sentences.enriched,
				sentencesIds: processedContext.sentences.formatted.map(
					s => s.sentenceId,
				),
				language: input.language,
				contributors: input.contributors,
				createdAt: Date.now(),
				genre: input.genre,
				source: input.source,
				// `updatedAt` will be set with `createdAt` initially
			};

			let specificMetadata: ContentMetadata;

			switch (input.contentType) {
				case ContentType.SONG: {
					// No need to cast to SongRequest, fields are on AddContentRequest (which input is)
					const interpreterSlug = input.contributors.main
						.toLowerCase()
						.replace(/\s+/g, '-');
					contentId = `song-${titleSlug}-${interpreterSlug}`;
					specificMetadata = {
						type: ContentType.SONG,
						interpreter: input.interpreter, // from AddContentRequest (SongCreationRequest part)
						youtube: input.youtube, // from AddContentRequest (SongCreationRequest part)
					};
					const songContent: SongContent = {
						...baseContentData,
						contentId,
						updatedAt: baseContentData.createdAt,
						metadata: specificMetadata,
					};
					processedContext.content = songContent;
					processedContext.contentType = ContentType.SONG;
					break;
				}

				case ContentType.BOOK_EXCERPT: {
					const authorSlug = input.contributors.main
						.toLowerCase()
						.replace(/\s+/g, '-');
					contentId = `book-${titleSlug}-${authorSlug}`;
					specificMetadata = {
						type: ContentType.BOOK_EXCERPT,
						isbn: input.isbn, // from AddContentRequest (BookExcerptCreationRequest part)
						pages: input.pages, // from AddContentRequest (BookExcerptCreationRequest part)
					};
					const bookContent: BookExcerptContent = {
						...baseContentData,
						contentId,
						updatedAt: baseContentData.createdAt,
						metadata: specificMetadata,
					};
					processedContext.content = bookContent;
					processedContext.contentType = ContentType.BOOK_EXCERPT;
					break;
				}

				case ContentType.VIDEO_TRANSCRIPT: {
					const creatorSlug = input.contributors.main
						.toLowerCase()
						.replace(/\s+/g, '-');
					contentId = `video-${titleSlug}-${creatorSlug}`;
					specificMetadata = {
						type: ContentType.VIDEO_TRANSCRIPT,
						duration: input.duration, // from AddContentRequest (VideoTranscriptCreationRequest part)
					};
					const videoContent: VideoTranscriptContent = {
						...baseContentData,
						contentId,
						updatedAt: baseContentData.createdAt,
						metadata: specificMetadata,
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

			// Only save tokens that weren't in the database before
			const {newTokens} = await this.writeDB.filterExistingTokens(
				processedContext.tokens.enriched,
			);
			if (newTokens.length > 0) {
				await this.writeDB.saveTokens(newTokens);
			}

			this.logger.info('Database operations completed');
			this.logger.end('processText');
			return currentContext; // Return the potentially modified context
		} catch (error) {
			this.logger.error(
				'Critical error in ContentProcessingPipeline.processText',
				error,
			);
			// Log a summary of the context at the time of failure
			// Pass currentContext which holds the state at the point of failure (or close to it)
			this.logContextState(
				'Pipeline failed - Context State at failure',
				currentContext,
				true,
			);
			throw error; // Re-throw the error
		}
	}

	// Added an 'isErrorLog' flag to use summarized logging for errors
	private logContextState(
		stepName: string,
		context: ContentProcessingContext,
		isErrorLog: boolean = false,
	) {
		if (isErrorLog) {
			const summarizedContext = {
				input: {
					contentType: context.input.contentType,
					title: context.input.title,
					language: context.input.language,
					contentLength: context.input.content.length,
				},
				sentences: {
					formattedCount: context.sentences.formatted.length,
					deduplicatedCount: context.sentences.deduplicated.length,
					enrichedCount: context.sentences.enriched.length,
					// Example: first formatted sentence if available
					firstFormattedSentence:
						context.sentences.formatted.length > 0
							? context.sentences.formatted[0]?.content
							: undefined,
				},
				tokens: {
					wordsCount: context.tokens.words.length,
					punctuationSignsCount: context.tokens.punctuationSigns.length,
					emojisCount: context.tokens.emojis.length,
					deduplicatedCount: context.tokens.deduplicated.length,
					enrichedCount: context.tokens.enriched.length,
				},
				currentContentObject: context.content
					? {
							contentType: context.content.contentType,
							contentId: context.content.contentId,
							title: context.content.title,
					  }
					: undefined,
			};
			this.logger.info(`${stepName} - Context State Summary`, {
				contextSummary: summarizedContext,
			});
			return;
		}

		// Original detailed logging for non-error cases
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
