import {SchemaType} from '@google/generative-ai';
import {
	ISong,
	IBookExcerpt,
	IVideoTranscript,
	ContentType,
} from '@/lib/types/content';
import {ISentence} from '../types/sentence';

export interface ContentSchema {
	type: SchemaType;
	items: {
		type: SchemaType;
		properties: Record<string, unknown>;
		required: string[];
	};
}

export interface ContentEnrichmentMetadata {
	contributor: {
		main: string;
		collaborators?: string[];
	};
	language: {
		main: string;
		variant: string[];
	};
}

export interface EnrichmentResult {
	sentences: ISentence[];
	metadata: ContentEnrichmentMetadata;
}

export interface IContentProcessor {
	enrichContent(
		content: ISong | IBookExcerpt | IVideoTranscript | unknown,
		metadata: ContentEnrichmentMetadata,
	): Promise<EnrichmentResult>;
	getSchema(): ContentSchema;
	getSystemInstruction(): string;
}

export class ContentSchemaFactory {
	static createSchema(contentType: ContentType): ContentSchema {
		switch (contentType) {
			case ContentType.SONG:
				return this.createSongSchema();
			case ContentType.BOOK_EXCERPT:
				return this.createBookExcerptSchema();
			case ContentType.VIDEO_TRANSCRIPT:
				return this.createVideoTranscriptSchema();
			default:
				throw new Error(`Unsupported content type: ${contentType}`);
		}
	}

	private static createSongSchema(): ContentSchema {
		return {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.OBJECT,
				properties: {
					sentenceId: {type: SchemaType.STRING},
					content: {type: SchemaType.STRING},
					translations: {
						type: SchemaType.OBJECT,
						properties: {
							english: {
								type: SchemaType.OBJECT,
								properties: {
									literal: {type: SchemaType.STRING},
									contextual: {type: SchemaType.STRING},
								},
								required: ['literal', 'contextual'],
							},
						},
						required: ['english'],
					},
					tokenIds: {
						type: SchemaType.ARRAY,
						items: {type: SchemaType.STRING},
					},
				},
				required: ['sentenceId', 'content', 'translations', 'tokenIds'],
			},
		};
	}

	private static createBookExcerptSchema(): ContentSchema {
		// Book excerpts use the same sentence structure as songs
		return this.createSongSchema();
	}

	private static createVideoTranscriptSchema(): ContentSchema {
		// Video transcripts use the same sentence structure as songs
		return this.createSongSchema();
	}
}
