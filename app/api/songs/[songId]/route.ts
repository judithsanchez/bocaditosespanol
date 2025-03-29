import {ReadDatabaseService} from '@/lib/services/ReadDatabaseService';
import {NextResponse} from 'next/server';
import {z} from 'zod';

export async function GET(
	request: Request,
	context: {params: {songId: string}},
) {
	try {
		const {songId} = context.params;
		const dbService = new ReadDatabaseService();

		const textEntries = await dbService.readFile('text-entries.json');
		const songEntry = textEntries.song.find(
			(entry: {songId: string}) => entry.songId === songId,
		);

		if (!songEntry) {
			return NextResponse.json({error: 'Song not found'}, {status: 404});
		}

		const allSentences = await dbService.readFile('sentences.json');
		const songSentences = allSentences[songId];

		if (!songSentences) {
			return NextResponse.json(
				{error: 'Song sentences not found'},
				{status: 404},
			);
		}

		const allTokens = await dbService.getTokens();
		const tokenMap = new Map(allTokens.map(token => [token.tokenId, token]));

		const orderedSentences = songEntry.lyrics
			.map((sentenceId: string) => {
				const sentence = songSentences.find(
					(s: {sentenceId: string}) =>
						s.sentenceId.toLowerCase() === sentenceId.toLowerCase(),
				);

				if (!sentence) {
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
			return NextResponse.json(
				{error: 'No valid sentences found'},
				{status: 404},
			);
		}

		const response = {
			metadata: songEntry.metadata,
			sentences: orderedSentences,
		};

		return NextResponse.json(response);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{error: 'Invalid data structure'},
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
