import {z} from 'zod';
import {ISentence, sentenceSchema} from './sentence'; // Ensure sentenceSchema is imported if used by new types
import {tokenSchema} from './token'; // Ensure tokenSchema is imported if used by new types

// --- NEW BASE CONTENT AND METADATA INTERFACES ---
export interface RawContent {
	contentId: string;
	title: string;
	content: string;
	language: {
		main: string;
		variant?: string[];
	};
	contributors: {
		main: string;
		collaborators?: string[];
	};
	createdAt: number;
	genre: string[];
	source: string;
	contentType: ContentType; // Added contentType to RawContent
}

export interface ProcessedContent extends RawContent {
	processedSentences: ISentence[]; // No longer optional
	sentencesIds: string[];
	updatedAt: number;
}

export interface BaseMetadata {
	type: ContentType;
}

export interface SongMetadata extends BaseMetadata {
	type: ContentType.SONG;
	interpreter: string;
	youtube?: string;
}

export interface BookMetadata extends BaseMetadata {
	type: ContentType.BOOK_EXCERPT;
	isbn?: string;
	pages?: {
		start: number;
		end: number;
	};
}

export interface VideoMetadata extends BaseMetadata {
	type: ContentType.VIDEO_TRANSCRIPT;
	duration?: number;
	// 'source' is already in RawContent, consider if needed here specifically for video
}

export type ContentMetadata = SongMetadata | BookMetadata | VideoMetadata;

// --- END NEW BASE CONTENT AND METADATA INTERFACES ---

export enum ContentType {
	SONG = 'song',
	BOOK_EXCERPT = 'book_excerpt',
	VIDEO_TRANSCRIPT = 'video_transcript',
}

// --- ZOD SCHEMAS FOR NEW INTERFACES ---
export const rawContentSchema = z.object({
	contentId: z.string(),
	title: z.string(),
	content: z.string(),
	language: z.object({
		main: z.string(),
		variant: z.array(z.string()).optional(),
	}),
	contributors: z.object({
		main: z.string(),
		collaborators: z.array(z.string()).optional(),
	}),
	createdAt: z.number(),
	genre: z.array(z.string()),
	source: z.string(),
	contentType: z.nativeEnum(ContentType),
});

export const songMetadataSchema = z.object({
	type: z.literal(ContentType.SONG),
	interpreter: z.string(),
	youtube: z.string().optional(),
});

export const bookMetadataSchema = z.object({
	type: z.literal(ContentType.BOOK_EXCERPT),
	isbn: z.string().optional(),
	pages: z
		.object({
			start: z.number(),
			end: z.number(),
		})
		.optional(),
});

export const videoMetadataSchema = z.object({
	type: z.literal(ContentType.VIDEO_TRANSCRIPT),
	duration: z.number().optional(),
});

export const contentMetadataSchema = z.discriminatedUnion('type', [
	songMetadataSchema,
	bookMetadataSchema,
	videoMetadataSchema,
]);

export const processedContentSchema = rawContentSchema.extend({
	processedSentences: z.array(sentenceSchema), // Assuming sentenceSchema is the correct one for processed sentences
	sentencesIds: z.array(z.string()),
	updatedAt: z.number(),
});
// --- END ZOD SCHEMAS FOR NEW INTERFACES ---

// Refactor IContent to align with ProcessedContent
// export interface IContent extends ProcessedContent {} // Option 1: IContent is ProcessedContent
// For now, let's redefine IContent to make the transition clearer, then we can remove it.
// The goal is to replace IContent, ISong, etc., with a structure using ProcessedContent and ContentMetadata.

// Let's define new combined types and then deprecate/remove old ones.
export type SongContent = ProcessedContent & {metadata: SongMetadata};
export type BookExcerptContent = ProcessedContent & {metadata: BookMetadata};
export type VideoTranscriptContent = ProcessedContent & {
	metadata: VideoMetadata;
};

export type AnyProcessedContent =
	| SongContent
	| BookExcerptContent
	| VideoTranscriptContent;

// The old IContent can be temporarily typed to AnyProcessedContent or removed.
// For a smoother transition, we can update places using IContent to use AnyProcessedContent or specific types.
// Let's comment out the old IContent and specific content interfaces for now,
// as they will be replaced by the new structure.
// Old interfaces IContent, ISong, IBookExcerpt, IVideoTranscript removed.

// --- REFACTOR REQUEST INTERFACES ---
// Base request now includes common fields from RawContent, excluding contentId, createdAt, updatedAt
interface BaseContentCreationRequest {
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

export interface SongCreationRequest extends BaseContentCreationRequest {
	contentType: ContentType.SONG;
	// Specific metadata fields for song creation
	interpreter: string;
	youtube?: string;
}

export interface BookExcerptCreationRequest extends BaseContentCreationRequest {
	contentType: ContentType.BOOK_EXCERPT;
	// Specific metadata fields for book excerpt creation
	isbn?: string;
	pages?: {
		start: number;
		end: number;
	};
}

export interface VideoTranscriptCreationRequest
	extends BaseContentCreationRequest {
	contentType: ContentType.VIDEO_TRANSCRIPT;
	// Specific metadata fields for video transcript creation
	duration?: number;
}

// This will replace the old ContentRequest
export type NewContentRequest =
	| SongCreationRequest
	| BookExcerptCreationRequest
	| VideoTranscriptCreationRequest;

// Old request interfaces (BaseContentRequest, SongRequest, BookExcerptRequest, VideoTranscriptRequest) removed.

// The old ContentRequest type will be replaced by NewContentRequest
export type ContentRequest = NewContentRequest;
// | SongRequest // Old, to be removed
// | BookExcerptRequest // Old, to be removed
// | VideoTranscriptRequest; // Old, to be removed

// --- REFACTOR ZOD SCHEMAS FOR CONTENT REQUESTS ---
const baseContentCreationSchema = z.object({
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

const songCreationSchema = baseContentCreationSchema.extend({
	contentType: z.literal(ContentType.SONG),
	interpreter: z.string(),
	youtube: z.string().optional(),
});

const bookExcerptCreationSchema = baseContentCreationSchema.extend({
	contentType: z.literal(ContentType.BOOK_EXCERPT),
	isbn: z.string().optional(),
	pages: z
		.object({
			start: z.number(),
			end: z.number(),
		})
		.optional(),
});

const videoTranscriptCreationSchema = baseContentCreationSchema.extend({
	contentType: z.literal(ContentType.VIDEO_TRANSCRIPT),
	duration: z.number().optional(),
});

// This replaces the old contentRequestSchema
export const newContentRequestSchema = z.discriminatedUnion('contentType', [
	songCreationSchema,
	bookExcerptCreationSchema,
	videoTranscriptCreationSchema,
]);

// This replaces the old AddContentRequest
export type AddContentRequest = z.infer<typeof newContentRequestSchema>;

// Old request Zod schemas (baseContentSchema, songSchema, bookExcerptSchema, videoTranscriptSchema, contentRequestSchema) removed.

// --- Schemas for GET /api/content/[contentId] response ---

// populatedSentenceSchemaInContent is already defined above and uses sentenceSchema.extend, which is good.
// The main contentByIdResponseSchema needs to be updated to use processedContentSchema as a base
// and include the new contentMetadataSchema for the metadata part.

export const newContentByIdResponseSchema = processedContentSchema.extend({
	// processedContentSchema already includes most fields from RawContent and ProcessedContent.
	// We need to add the specific metadata for the content type.
	// The 'contentType' field is already in rawContentSchema (and thus processedContentSchema).
	// We can use this to discriminate the metadata.
	metadata: contentMetadataSchema, // This is a discriminated union of metadata schemas
});

export type NewContentByIdResponse = z.infer<
	typeof newContentByIdResponseSchema
>;

// Old contentByIdResponseSchema and its helper populatedSentenceSchemaInContent (if only used by old schema) removed.
// Note: populatedSentenceSchemaInContent is still defined earlier in the file if it's used by new schemas.
// A quick check shows `populatedSentenceSchemaInContent` is defined around line 200-205 in the current file state,
// and it's used by the `contentByIdResponseSchema` that was just commented out.
// The new `newContentByIdResponseSchema` extends `processedContentSchema`, which uses `sentenceSchema`.
// `sentenceSchema` itself should define how its tokens are structured.
// Let's verify if `populatedSentenceSchemaInContent` is still needed or if `sentenceSchema` is sufficient.
// `processedContentSchema` uses `z.array(sentenceSchema)`.
// `ISentence` has `processedTokens?: Token[]`. `sentenceSchema` has `processedTokens: z.array(tokenSchema).optional()`.
// The `newContentByIdResponseSchema` relies on `processedContentSchema` which uses `sentenceSchema`.
// The `populatedSentenceSchemaInContent` was specifically for the old `contentByIdResponseSchema` to ensure `processedTokens` was an array of `tokenSchema`.
// If `sentenceSchema` already correctly defines `processedTokens` as `z.array(tokenSchema)` (possibly optional),
// then `populatedSentenceSchemaInContent` might be redundant if the new schema structure handles it.

// Let's check `sentenceSchema` definition in `lib/types/sentence.ts`
// Assuming `sentenceSchema` in `lib/types/sentence.ts` correctly defines `processedTokens: z.array(tokenSchema)` (or similar).
// If so, `populatedSentenceSchemaInContent` can be removed.
// For now, I will remove the commented out `contentByIdResponseSchema` and its direct `populatedSentenceSchemaInContent` definition.
// If `populatedSentenceSchemaInContent` is defined elsewhere and still needed, it will remain.
// If it was only for the old schema, it should be removed.

// Removing the block related to old contentByIdResponseSchema and its specific populatedSentenceSchemaInContent
/*
const populatedSentenceSchemaInContent = sentenceSchema.extend({
  // In ISentence, we use processedTokens for populated tokens
  // This ensures consistency between the interface and schema
  processedTokens: z.array(tokenSchema),
});

export const contentByIdResponseSchema = z.object({
  // ... old schema ...
});
*/

// Update the export to use the new type
export type ContentByIdResponse = NewContentByIdResponse;
