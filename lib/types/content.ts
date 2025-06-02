import {z} from 'zod';
import {ISentence} from './sentence';

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
	processedSentences?: ISentence[];
	sentencesIds: string[];
	language: {
		main: string;
		variant?: string[];
	};
	contributors: {
		main: string;
		collaborators?: string[];
	};
	createdAt: number;
	updatedAt: number;
	genre: string[];
	source: string;
}

export interface ISong extends IContent {
	contentType: ContentType.SONG;
	metadata?: {
		title: string;
		interpreter: string;
		youtube?: string;
	};
}

export interface IBookExcerpt extends IContent {
	contentType: ContentType.BOOK_EXCERPT;
	pages?: {
		start: number;
		end: number;
	};
	isbn?: string;
}

export interface IVideoTranscript extends IContent {
	contentType: ContentType.VIDEO_TRANSCRIPT;
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
	contributors: {
		main: string;
		collaborators?: string[];
	};
}

export interface SongRequest extends BaseContentRequest {
	contentType: ContentType.SONG;
}

export interface BookExcerptRequest extends BaseContentRequest {
	contentType: ContentType.BOOK_EXCERPT;
	pages?: {
		start: number;
		end: number;
	};
	isbn?: string;
}

export interface VideoTranscriptRequest extends BaseContentRequest {
	contentType: ContentType.VIDEO_TRANSCRIPT;
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
	contributors: z.object({
		main: z.string().min(1),
		collaborators: z.array(z.string()).optional(),
	}),
});

const songSchema = baseContentSchema.extend({
	contentType: z.literal(ContentType.SONG),
});

const bookExcerptSchema = baseContentSchema.extend({
	contentType: z.literal(ContentType.BOOK_EXCERPT),
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
});

export const contentRequestSchema = z.discriminatedUnion('contentType', [
	songSchema,
	bookExcerptSchema,
	videoTranscriptSchema,
]);

export type AddContentRequest = z.infer<typeof contentRequestSchema>;

// --- Schemas for GET /api/content/[contentId] response ---

// Import sentenceSchema and tokenSchema if not already (assuming they are in scope)
// For clarity, let's ensure they are explicitly available or re-import if needed.
// Assuming sentenceSchema and tokenSchema are correctly defined in their respective files
// and tokenSchema is the final, fully processed token schema.
import {sentenceSchema} from './sentence'; // sentenceSchema should ideally include tokens array
import {tokenSchema} from './token';

// Define a schema for a sentence that *must* have its tokens populated for this response.
// If sentenceSchema already defines tokens as z.array(tokenSchema).optional(),
// we'll extend it to make tokens mandatory here.
const populatedSentenceSchemaInContent = sentenceSchema.extend({
	// In ISentence, we use processedTokens for populated tokens
	// This ensures consistency between the interface and schema
	processedTokens: z.array(tokenSchema),
});

export const contentByIdResponseSchema = z.object({
	contentType: z.nativeEnum(ContentType),
	contentId: z.string(),
	title: z.string(),
	// The raw 'content' string (original full text) is part of IContent, let's include it.
	content: z.string(),
	language: z.object({
		main: z.string(),
		variant: z.array(z.string()).optional(), // Matches IContent
	}),
	contributors: z.object({
		main: z.string(),
		collaborators: z.array(z.string()).optional(),
	}),
	createdAt: z.number(),
	updatedAt: z.number(),
	genre: z.array(z.string()),
	source: z.string(),
	// processedSentences from IContent is optional, but for this response, it's the main data.
	// It should contain fully populated sentences.
	processedSentences: z.array(populatedSentenceSchemaInContent),
	sentencesIds: z.array(z.string()), // Also part of IContent

	// Specific fields for different content types, handled as optional or part of a general metadata object.
	// For songs, metadata is a distinct object.
	// For book_excerpts, fields like 'pages', 'isbn' are top-level in IBookExcerpt.

	// Option 1: Generic metadata field + type-specific optional fields
	metadata: z.record(z.string(), z.any()).optional(), // For song's metadata block
	pages: z.object({start: z.number(), end: z.number()}).optional(), // For book_excerpt
	isbn: z.string().optional(), // For book_excerpt

	// Note: If we want to strictly follow discriminated unions for response too,
	// it would be more complex but also more type-safe.
	// For now, a combined object with optional fields is simpler for the response.
});

export type ContentByIdResponse = z.infer<typeof contentByIdResponseSchema>;
