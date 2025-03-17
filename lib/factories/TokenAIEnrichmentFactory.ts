import {SchemaType} from '@google/generative-ai';
import {PartOfSpeech} from '@/lib/types/common';

export class TokenAIEnrichmentFactory {
	static createSenseSchema() {
		return {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.OBJECT,
				properties: {
					tokenId: {type: SchemaType.STRING},
					content: {type: SchemaType.STRING},
					senses: {
						type: SchemaType.ARRAY,
						items: {
							type: SchemaType.OBJECT,
							properties: {
								tokenId: {type: SchemaType.STRING},
								senseId: {type: SchemaType.STRING},
								partOfSpeech: {
									type: SchemaType.STRING,
									enum: Object.values(PartOfSpeech),
								},
								translations: {
									type: SchemaType.OBJECT,
									properties: {
										english: {
											type: SchemaType.ARRAY,
											items: {type: SchemaType.STRING},
										},
									},
									required: ['english'],
								},
							},
							required: ['tokenId', 'senseId', 'partOfSpeech', 'translations'],
						},
					},
				},
				required: ['tokenId', 'content', 'senses'],
			},
		};
	}

	static createSlangSchema() {
		return {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.OBJECT,
				properties: {
					tokenId: {type: SchemaType.STRING},
					content: {type: SchemaType.STRING},
					isSlang: {type: SchemaType.BOOLEAN},
				},
				required: ['tokenId', 'content', 'isSlang'],
			},
		};
	}

	static createCognateSchema() {
		return {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.OBJECT,
				properties: {
					tokenId: {type: SchemaType.STRING},
					content: {type: SchemaType.STRING},
					isCognate: {type: SchemaType.BOOLEAN},
					isFalseCognate: {type: SchemaType.BOOLEAN},
				},
				required: ['tokenId', 'content', 'isCognate', 'isFalseCognate'],
			},
		};
	}
}
