import {NextResponse} from 'next/server';
import {DatabaseService} from '@/lib/services/DatabaseService';
import {SongProcessingPipeline} from '@/lib/pipelines/SongProcessingPipeline';
import {z} from 'zod';
import {songRequestSchema} from '@/lib/types/common';

// GET: List all songs
export async function GET() {
	try {
		const dbService = new DatabaseService();
		const textEntries = await dbService.readFile('text-entries.json');
		const songs = textEntries.song || [];

		const simplifiedSongs = songs.map(
			(song: {songId: unknown; metadata: unknown}) => ({
				songId: song.songId,
				metadata: song.metadata,
			}),
		);

		return NextResponse.json(simplifiedSongs);
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

// POST: Create a new song
export async function POST(request: Request) {
	try {
		const body = await request.json();

		// Validate request body
		const validatedBody = songRequestSchema.parse(body);

		const pipeline = new SongProcessingPipeline();
		const result = await pipeline.processText(validatedBody);

		return NextResponse.json(result, {status: 201});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{error: 'Invalid request format'},
				{status: 400},
			);
		} else if (error instanceof Error) {
			return NextResponse.json({error: error.message}, {status: 400});
		}
		return NextResponse.json(
			{error: 'An unknown error occurred'},
			{status: 400},
		);
	}
}
