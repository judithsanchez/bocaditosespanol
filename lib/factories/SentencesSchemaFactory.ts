import {SchemaType} from '@google/generative-ai';
import {ContentType} from '../types/content';
// TODO: move the translations to the sentences factories

export class SentencesSchemaFactory {
	static createSchema(contentType: ContentType) {
		switch (contentType) {
			case ContentType.SONG:
				return this.createSongSentencesSchema();
			case ContentType.BOOK_EXCERPT:
				return this.createBookExcerptSentencesSchema();
			case ContentType.VIDEO_TRANSCRIPT:
				return this.createVideoTranscriptSentencesSchema();
			default:
				throw new Error(`Unsupported content type: ${contentType}`);
		}
	}

	// Since the learning insights structure is common, we can use a shared base schema
	private static createBaseSchema() {
		return {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.OBJECT,
				properties: {
					sentenceId: {type: SchemaType.STRING},
					content: {type: SchemaType.STRING},
					learningInsights: {
						type: SchemaType.OBJECT,
						properties: {
							insight: {
								type: SchemaType.STRING,
								description: 'Explanation for Spanish learners.',
							},
							difficulty: {
								type: SchemaType.STRING,
								description: 'Estimated difficulty level.',
								enum: ['beginner', 'intermediate', 'advanced'],
							},
						},
						required: ['insight', 'difficulty'],
					},
				},
				required: ['sentenceId', 'content', 'learningInsights'],
			},
		};
	}

	// Use base schema for song lyrics
	private static createSongSentencesSchema() {
		return this.createBaseSchema();
	}

	// Use base schema for book excerpts
	private static createBookExcerptSentencesSchema() {
		return this.createBaseSchema();
	}

	// Use base schema for video transcripts
	private static createVideoTranscriptSentencesSchema() {
		return this.createBaseSchema();
	}
}
