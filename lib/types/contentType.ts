import {z} from 'zod';
import {ISentence} from './common';

export enum ContentType {
	SONG = 'song',
	BOOK_EXCERPT = 'book_excerpt',
	VIDEO_TRANSCRIPT = 'video_transcript',
}

export interface IContent {
	contentType: ContentType;
	contentId: string;
	title: string;
	content: string;
	processedContent?: ISentence[];
	sentencesIds: string[];
	language: {
		main: string;
		variant?: string[];
	};
	createdAt: number;
	updatedAt: number;
	genre: string[];
	source: string;
}
export interface ISong extends IContent {
	contentType: ContentType.SONG;
	interpreter: string;
	feat?: string[];
}

export interface IBookExcerpt extends IContent {
	contentType: ContentType.BOOK_EXCERPT;
	author: string;
	pages?: {
		start: number;
		end: number;
	};
	isbn?: string;
}

export interface IVideoTranscript extends IContent {
	contentType: ContentType.VIDEO_TRANSCRIPT;
	creator: string;
	contributors?: string[];
}
interface BaseContentRequest {
	contentType: ContentType;
	title: string;
	genre: string[];
	language: {
		main: string;
		variant: string[];
	};
	content: string;
	source: string;
}

export interface SongRequest extends BaseContentRequest {
	contentType: ContentType.SONG;
	interpreter: string;
	feat?: string[];
}

export interface BookExcerptRequest extends BaseContentRequest {
	contentType: ContentType.BOOK_EXCERPT;
	author: string;
	pages?: {
		start: number;
		end: number;
	};
	isbn?: string;
}

export interface VideoTranscriptRequest extends BaseContentRequest {
	contentType: ContentType.VIDEO_TRANSCRIPT;
	creator: string;
	contributors?: string[];
}

export type ContentRequest =
	| SongRequest
	| BookExcerptRequest
	| VideoTranscriptRequest;

const baseContentSchema = z.object({
	contentType: z.nativeEnum(ContentType),
	title: z.string().min(1),
	genre: z.array(z.string()),
	language: z.object({
		main: z.string(),
		variant: z.array(z.string()),
	}),
	content: z.string().min(1),
	source: z.string().min(1),
});

const songSchema = baseContentSchema.extend({
	contentType: z.literal(ContentType.SONG),
	interpreter: z.string().min(1),
	feat: z.array(z.string()).optional(),
});

const bookExcerptSchema = baseContentSchema.extend({
	contentType: z.literal(ContentType.BOOK_EXCERPT),
	author: z.string().min(1),
	pages: z
		.object({
			start: z.number(),
			end: z.number(),
		})
		.optional(),
	isbn: z.string().optional(),
});

const videoTranscriptSchema = baseContentSchema.extend({
	contentType: z.literal(ContentType.VIDEO_TRANSCRIPT),
	creator: z.string().min(1),
	contributors: z.array(z.string()).optional(),
});

export const contentRequestSchema = z.discriminatedUnion('contentType', [
	songSchema,
	bookExcerptSchema,
	videoTranscriptSchema,
]);

export type AddContentRequest = z.infer<typeof contentRequestSchema>;
