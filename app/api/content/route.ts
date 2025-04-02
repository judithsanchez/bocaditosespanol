import {NextResponse} from 'next/server';
import {ContentProcessingPipeline} from '@/lib/pipelines/ContentProcessingPipeline';
import {z} from 'zod';
import {ContentType, contentRequestSchema} from '@/lib/types/contentType';
import {ReadDatabaseService} from '@/lib/services/ReadDatabaseService';
import {Logger} from '@/lib/utils/Logger';

const logger = new Logger('ContentRoute');

export async function GET(request: Request) {
	logger.start('GET');
	try {
		const {searchParams} = new URL(request.url);
		const contentType = searchParams.get('type');

		logger.info('Processing GET request', {
			contentType: contentType || 'all',
			url: request.url,
		});

		const dbService = new ReadDatabaseService();
		const textEntries = await dbService.readFile('text-entries.json');

		if (
			contentType &&
			Object.values(ContentType).includes(contentType as ContentType)
		) {
			const filteredEntries = textEntries[contentType] || [];

			const simplifiedEntries = filteredEntries.map((entry: any) => ({
				id: entry.contentId,
				metadata: entry.metadata,
			}));

			logger.info('Returning filtered content', {
				type: contentType,
				count: simplifiedEntries.length,
			});

			logger.end('GET');
			return NextResponse.json(simplifiedEntries);
		}

		const allEntries: any[] = [];

		Object.keys(textEntries).forEach(type => {
			if (Array.isArray(textEntries[type])) {
				const entriesOfType = textEntries[type].map((entry: any) => ({
					id: entry.contentId,
					type,
					metadata: entry.metadata,
				}));
				allEntries.push(...entriesOfType);
			}
		});

		logger.info('Returning all content', {count: allEntries.length});

		logger.end('GET');
		return NextResponse.json(allEntries);
	} catch (error) {
		logger.error('Error processing GET request', error);

		if (error instanceof z.ZodError) {
			logger.end('GET');
			return NextResponse.json(
				{error: 'Invalid data structure'},
				{status: 500},
			);
		} else if (error instanceof Error) {
			logger.end('GET');
			return NextResponse.json({error: error.message}, {status: 400});
		}

		logger.end('GET');
		return NextResponse.json(
			{error: 'An unknown error occurred'},
			{status: 500},
		);
	}
}

export async function POST(request: Request) {
	logger.start('POST');
	try {
		const body = await request.json();
		logger.info('Received content creation request', {
			contentType: body.contentType,
			title: body.title,
		});

		const validatedContent = contentRequestSchema.parse(body);
		logger.info('Request validation successful', {
			contentType: validatedContent.contentType,
		});

		const pipeline = new ContentProcessingPipeline();
		logger.info('Pipeline created', {
			contentType: validatedContent.contentType,
		});

		const result = await pipeline.processText(validatedContent);
		logger.info('Content processed successfully', {
			contentId: result.content.contentId,
			contentType: validatedContent.contentType,
		});

		logger.end('POST');
		return NextResponse.json(result, {status: 201});
	} catch (error) {
		logger.error('Error processing POST request', error);

		if (error instanceof z.ZodError) {
			logger.info('Validation error', {
				details: JSON.stringify(error.format()),
			});

			logger.end('POST');
			return NextResponse.json(
				{error: 'Invalid request format', details: error.format()},
				{status: 400},
			);
		} else if (error instanceof Error) {
			logger.end('POST');
			return NextResponse.json({error: error.message}, {status: 400});
		}

		logger.end('POST');
		return NextResponse.json(
			{error: 'An unknown error occurred'},
			{status: 400},
		);
	}
}
