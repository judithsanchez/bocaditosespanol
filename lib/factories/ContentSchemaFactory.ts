import {SchemaType} from '@google/generative-ai';
import {ContentType, ISentence} from '@/lib/types/common';
import {ISong} from '@/lib/types/entries';

export interface ContentSchema {
	type: SchemaType;
	items: {
		type: SchemaType;
		properties: Record<string, unknown>;
		required: string[];
	};
}

export interface ContentEnrichmentMetadata {
	interpreter?: string;
	author?: string;
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
		content: ISong | unknown,
		metadata: ContentEnrichmentMetadata,
	): Promise<EnrichmentResult>;
	getSchema(): ContentSchema;
	getSystemInstruction(): string;
}

export class ContentSchemaFactory {
	static createSchema(contentType: ContentType): ContentSchema {
		switch (contentType) {
			case 'song':
				return this.createSongSchema();
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
}
