import {ReadDatabaseService} from '@/lib/services/ReadDatabaseService';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {ContentType} from '@/lib/types/content';
import {Logger} from '@/lib/utils/Logger';

export async function GET(
	request: Request,
	context: {params: {contentId: string}},
) {
	const logger = new Logger('ContentAPI');
	logger.start('GET');

	try {
		const {contentId} = context.params;
		logger.info(`Fetching content with ID: ${contentId}`);

		const dbService = new ReadDatabaseService();

		const textEntries = await dbService.readFile('text-entries.json');
		logger.info('Text entries loaded successfully');

		let contentEntry = null;
		let contentType = null;

		for (const type of Object.values(ContentType)) {
			if (textEntries[type]) {
				const entry = textEntries[type].find(
					(entry: {[key: string]: string}) => entry.contentId === contentId,
				);

				if (entry) {
					contentEntry = entry;
					contentType = type;
					logger.info(`Content found with type: ${type}`, {contentId, type});
					break;
				}
			}
		}

		if (!contentEntry) {
			logger.error(
				`Content not found for ID: ${contentId}`,
				new Error('Content not found'),
			);
			return NextResponse.json({error: 'Content not found'}, {status: 404});
		}

		const allSentences = await dbService.readFile('sentences.json');
		const contentSentences = allSentences[contentId];

		if (!contentSentences) {
			logger.error(
				`Sentences not found for content ID: ${contentId}`,
				new Error('Content sentences not found'),
			);
			return NextResponse.json(
				{error: 'Content sentences not found'},
				{status: 404},
			);
		}

		logger.info(
			`Found ${contentSentences.length} sentences for content ID: ${contentId}`,
		);

		const allTokens = await dbService.getTokens();
		const tokenMap = new Map(allTokens.map(token => [token.tokenId, token]));
		logger.info(`Loaded ${allTokens.length} tokens`);

		const orderedSentences = contentEntry.content
			.map((sentenceId: string) => {
				const sentence = contentSentences.find(
					(s: {sentenceId: string}) =>
						s.sentenceId.toLowerCase() === sentenceId.toLowerCase(),
				);

				if (!sentence) {
					logger.info(`Sentence not found: ${sentenceId}`);
					return null;
				}

				return {
					content: sentence.content,
					sentenceId: sentence.sentenceId,
					tokenIds: sentence.tokenIds,
					translations: sentence.translations,
					tokens: sentence.tokenIds.map((tokenId: string) =>
						tokenMap.get(tokenId),
					),
					...(sentence.learningInsights &&
						Object.keys(sentence.learningInsights).length > 0 && {
							learningInsights: sentence.learningInsights,
						}),
				};
			})
			.filter(Boolean);

		if (orderedSentences.length === 0) {
			logger.error(
				`No valid sentences found for content ID: ${contentId}`,
				new Error('No valid sentences found'),
			);
			return NextResponse.json(
				{error: 'No valid sentences found'},
				{status: 404},
			);
		}

		logger.info(`Successfully processed ${orderedSentences.length} sentences`);

		const response = {
			metadata: contentEntry.metadata,
			sentences: orderedSentences,
			contentType: contentType,
		};

		logger.end('GET');
		return NextResponse.json(response);
	} catch (error) {
		if (error instanceof z.ZodError) {
			logger.error('Invalid data structure', error);
			return NextResponse.json(
				{error: 'Invalid data structure'},
				{status: 500},
			);
		} else if (error instanceof Error) {
			logger.error('Request error', error);
			return NextResponse.json({error: error.message}, {status: 400});
		}
		logger.error('Unknown error', error);
		logger.end('GET');
		return NextResponse.json(
			{error: 'An unknown error occurred'},
			{status: 500},
		);
	}
}
