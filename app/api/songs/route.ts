import {NextResponse} from 'next/server';
import {ReadDatabaseService} from '@/lib/services/ReadDatabaseService';
import {ContentType} from '@/lib/types/content';
import {Logger} from '@/lib/utils/Logger';

const logger = new Logger('SongsRoute');

export async function GET() {
	logger.start('GET');

	try {
		const dbService = new ReadDatabaseService();
		const rawDataFromFile = await dbService.readFile('text-entries.json');

		if (!rawDataFromFile) {
			logger.error(
				'Failed to read text-entries.json',
				new Error('File read failed'),
			);
			return NextResponse.json({error: 'Database read error'}, {status: 500});
		}

		// Cast to Record<ContentType, any[]> to access song entries
		const textEntries = rawDataFromFile as Record<string, any[]>;
		const songEntries = textEntries[ContentType.SONG] || [];

		// Return minimal song information needed for the list
		const simplifiedSongs = songEntries.map(song => ({
			contentId: song.contentId,
			metadata: {
				title: song.metadata?.title || song.title,
				interpreter: song.metadata?.interpreter || song.contributors?.main,
			},
			language: song.language,
			genre: song.genre,
		}));

		logger.info(`Returning ${simplifiedSongs.length} songs`);
		logger.end('GET');

		return NextResponse.json(simplifiedSongs);
	} catch (error) {
		logger.error('Error processing GET request', error);
		logger.end('GET');

		return NextResponse.json({error: 'Failed to fetch songs'}, {status: 500});
	}
}
