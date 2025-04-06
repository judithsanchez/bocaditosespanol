import {SchemaType} from '@google/generative-ai';
import {ContentType} from '@/lib/types/grammar';
// TODO: move the translations to the sentences factories

export class SentencesSchemaFactory {
	static createSchema(contentType: ContentType) {
		switch (contentType) {
			case 'song':
				return this.createSongSentencesSchema();
			default:
				throw new Error(`Unsupported content type: ${contentType}`);
		}
	}

	private static createSongSentencesSchema() {
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
}
