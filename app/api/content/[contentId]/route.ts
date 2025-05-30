import {ReadDatabaseService} from '@/lib/services/ReadDatabaseService';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {
	ContentType,
	IContent,
	ISong,
	IBookExcerpt,
	contentByIdResponseSchema,
} from '@/lib/types/content';
import {ISentence} from '@/lib/types/sentence';
import {Token} from '@/lib/types/token';
import {Logger} from '@/lib/utils/Logger';

export async function GET(
	request: Request,
	context: {params: {contentId: string}},
) {
	const logger = new Logger('ContentAPIById');
	logger.start('GET');

	try {
		const {contentId} = context.params;
		logger.info(`Fetching content with ID: ${contentId}`);

		const dbService = new ReadDatabaseService();

		// 1. Fetch all text entries
		const textEntriesData = await dbService.readFile('text-entries.json');
		if (!textEntriesData) {
			logger.error(
				'Failed to read text-entries.json',
				new Error('Failed to read text-entries.json'),
			);
			return NextResponse.json(
				{error: 'Database read error: text entries'},
				{status: 500},
			);
		}
		// Type assertion for the raw data structure
		const allTextEntries = textEntriesData as Record<
			ContentType,
			Array<IContent | ISong | IBookExcerpt>
		>;

		let contentEntry: IContent | ISong | IBookExcerpt | undefined;
		let foundContentType: ContentType | undefined;

		// Find the content entry by contentId across all types
		for (const type of Object.values(ContentType)) {
			if (allTextEntries[type]) {
				const entry = allTextEntries[type].find(e => e.contentId === contentId);
				if (entry) {
					contentEntry = entry;
					foundContentType = type;
					logger.info(`Content found with type: ${type}`, {contentId, type});
					break;
				}
			}
		}

		if (!contentEntry || !foundContentType) {
			logger.error(
				`Content not found for ID: ${contentId}`,
				new Error('Content not found'),
			);
			return NextResponse.json({error: 'Content not found'}, {status: 404});
		}

		let processedSentencesWithTokens: ISentence[] = [];

		// 2. Check if the entry already has processedSentences (like in new "nuevayol" song or "book_excerpt")
		if (
			contentEntry.processedSentences &&
			contentEntry.processedSentences.length > 0
		) {
			logger.info(`Using pre-processed sentences for content ID: ${contentId}`);
			// Ensure tokens are populated if they are just IDs in pre-processed sentences
			// (Though the example data shows them fully populated)
			// For now, assume pre-processedSentences are complete as per IContent.
			// If tokens within processedSentences are just IDs, they'd need populating here.
			// The `contentByIdResponseSchema` expects `tokens` array within each sentence.
			// The `ISentence` interface has `processedTokens?: Token[]`.
			// The `docs/data/text-entries.json` for "nuevayol" and "book_excerpt"
			// already have fully populated tokens within `processedSentences`.
			// So, we can directly use them if they conform to ISentence with Token objects.

			// We need to ensure the structure matches `populatedSentenceSchemaInContent`
			// which expects `tokens` (not `processedTokens`) to be an array of `Token`.
			// The `ISentence` has `processedTokens?: Token[]` and `tokenIds: string[]`.
			// The `sentenceSchema` has `tokens: z.array(tokenSchema).optional()`.
			// The example data has `tokenIds` and `translations` etc., but not `tokens` array directly.
			// The `processedSentences` in the example data *does* have `tokenIds`, but not the `tokens` objects themselves.
			// This means we *always* need to fetch tokens.

			// Let's re-evaluate: The `processedSentences` in `docs/data/text-entries.json` for `nuevayol` and `book_excerpt`
			// *do not* contain the full token objects, only `tokenIds`.
			// So, we must always fetch and populate them.
			logger.info(
				`Populating tokens for pre-defined processedSentences for content ID: ${contentId}`,
			);
		}

		// 3. Fetch all sentences and tokens if not using pre-processed or to populate tokens
		const allSentencesData = await dbService.readFile('sentences.json');
		if (!allSentencesData) {
			logger.error(
				'Failed to read sentences.json',
				new Error('Failed to read sentences.json'),
			);
			return NextResponse.json(
				{error: 'Database read error: sentences'},
				{status: 500},
			);
		}
		const allSentences = allSentencesData as Record<string, ISentence[]>;
		const contentSentencesFromDb = allSentences[contentId] || [];

		if (
			contentSentencesFromDb.length === 0 &&
			(!contentEntry.processedSentences ||
				contentEntry.processedSentences.length === 0)
		) {
			logger.error(
				`No sentences found in sentences.json or in entry for content ID: ${contentId}`,
				new Error('No sentences found'),
			);
			// If sentencesIds exist on contentEntry, it's an error if they don't resolve.
			// If no sentencesIds and no processedSentences, it might be an incomplete entry.
			return NextResponse.json(
				{error: 'Content sentences not found'},
				{status: 404},
			);
		}

		const allTokensFromDb = await dbService.getTokens();
		const tokenMap = new Map(
			allTokensFromDb.map(token => [token.tokenId, token]),
		);
		logger.info(`Loaded ${allTokensFromDb.length} tokens into map`);

		// Determine which set of sentences to use as the base:
		// Option A: Use `processedSentences` from the entry if they exist (like in new examples)
		// Option B: Use sentences from `sentences.json` keyed by `contentId` (older entries)
		// Then, ensure they are ordered by `contentEntry.sentencesIds`

		const baseSentencesToProcess: ISentence[] = [];
		if (
			contentEntry.processedSentences &&
			contentEntry.processedSentences.length > 0
		) {
			// These are partial sentences (missing full token objects)
			baseSentencesToProcess.push(...contentEntry.processedSentences);
		} else if (contentSentencesFromDb.length > 0) {
			baseSentencesToProcess.push(...contentSentencesFromDb);
		}

		// Order and populate sentences
		processedSentencesWithTokens = contentEntry.sentencesIds
			.map((sentenceId: string) => {
				// Find the sentence from our combined/chosen list
				const sentenceData = baseSentencesToProcess.find(
					s => s.sentenceId.toLowerCase() === sentenceId.toLowerCase(),
				);

				if (!sentenceData) {
					logger.error(
						`Sentence data not found for ID: ${sentenceId}`,
						new Error('Sentence data not found'),
					);
					return null;
				}

				// Populate tokens for this sentence
				const populatedTokens: Token[] = sentenceData.tokenIds
					.map(tokenId => {
						const token = tokenMap.get(tokenId);
						if (!token) {
							logger.error(
								`Token not found for ID: ${tokenId} in sentence ${sentenceId}`,
								new Error('Token not found'),
							);
						}
						return token;
					})
					.filter(Boolean) as Token[]; // Filter out undefined if any token not found

				return {
					...sentenceData, // spread all properties from ISentence
					tokens: populatedTokens, // ensure this field is named 'tokens' for the schema
				};
			})
			.filter(Boolean) as ISentence[]; // Filter out nulls if any sentence not found
		if (processedSentencesWithTokens.length === 0) {
			logger.error(
				`No valid sentences could be processed for content ID: ${contentId}`,
				new Error('Sentence processing resulted in an empty array'),
			);
			return NextResponse.json(
				{error: 'No valid sentences found or processed'},
				{status: 404},
			);
		}
		logger.info(
			`Successfully processed ${processedSentencesWithTokens.length} sentences with tokens.`,
		);

		// 4. Construct the response object based on IContent and type-specific interfaces
		const baseResponseData = {
			contentType: contentEntry.contentType,
			contentId: contentEntry.contentId,
			title: contentEntry.title,
			content: contentEntry.content, // The original full text
			language: contentEntry.language,
			contributors: contentEntry.contributors,
			createdAt: contentEntry.createdAt,
			updatedAt: contentEntry.updatedAt,
			genre: contentEntry.genre,
			source: contentEntry.source,
			processedSentences: processedSentencesWithTokens,
			sentencesIds: contentEntry.sentencesIds,
		};

		let finalResponseData: any = {...baseResponseData};

		if (foundContentType === ContentType.SONG) {
			const rawSongEntry = contentEntry as any; // Cast to any to check for legacy metadata
			if (rawSongEntry.metadata) {
				finalResponseData.metadata = rawSongEntry.metadata;
			}
		} else if (foundContentType === ContentType.BOOK_EXCERPT) {
			const bookEntry = contentEntry as IBookExcerpt;
			if (bookEntry.pages) finalResponseData.pages = bookEntry.pages;
			if (bookEntry.isbn) finalResponseData.isbn = bookEntry.isbn;
		}
		// Add other type-specific fields if necessary

		// 5. Validate the response
		const validatedResponse =
			contentByIdResponseSchema.parse(finalResponseData);

		logger.end('GET');
		return NextResponse.json(validatedResponse);
	} catch (error) {
		logger.error('Error in GET [contentId]', error);
		if (error instanceof z.ZodError) {
			logger.error('Zod validation error for response', error);
			return NextResponse.json(
				{error: 'Invalid data structure for response', details: error.format()},
				{status: 500},
			);
		} else if (error instanceof Error) {
			return NextResponse.json({error: error.message}, {status: 400});
		}
		return NextResponse.json(
			{error: 'An unknown error occurred'},
			{status: 500},
		);
	}
}
