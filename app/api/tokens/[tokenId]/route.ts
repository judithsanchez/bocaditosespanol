import {NextResponse} from 'next/server';
import {DatabaseService} from '@/lib/services/DatabaseService';
import {z} from 'zod';

// GET: Get a specific token by ID
export async function GET(
	request: Request,
	{params}: {params: {tokenId: string}},
) {
	try {
		// Await the params object before accessing tokenId
		const resolvedParams = await params;
		const tokenId = resolvedParams.tokenId;
		const dbService = new DatabaseService();

		// Get all tokens and find the one with matching ID
		const allTokens = await dbService.getTokens();
		const token = allTokens.find(token => token.tokenId === tokenId);

		if (!token) {
			return NextResponse.json({error: 'Token not found'}, {status: 404});
		}

		return NextResponse.json(token);
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
