import {SchemaType} from '@google/generative-ai';
import {PartOfSpeech, TokenType} from '@bocaditosespanol/shared';

export class BaseWordSchemaFactory {
	static createSchema() {
		return {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.OBJECT,
				properties: {
					tokenId: {type: SchemaType.STRING},
					tokenType: {type: SchemaType.STRING, enum: [TokenType.Word]},
					content: {type: SchemaType.STRING},
					normalizedToken: {type: SchemaType.STRING},
					translations: {
						type: SchemaType.OBJECT,
						properties: {
							english: {
								type: SchemaType.ARRAY,
								items: {type: SchemaType.STRING},
							},
						},
					},
					hasSpecialChar: {type: SchemaType.BOOLEAN},
					partOfSpeech: {
						type: SchemaType.STRING,
						enum: Object.values(PartOfSpeech),
					},
					isSlang: {type: SchemaType.BOOLEAN},
					isCognate: {type: SchemaType.BOOLEAN},
					isFalseCognate: {type: SchemaType.BOOLEAN},
				},
				required: [
					'tokenId',
					'tokenType',
					'content',
					'normalizedToken',
					'translations',
					'hasSpecialChar',
					'partOfSpeech',
					'isSlang',
					'isCognate',
					'isFalseCognate',
				],
			},
		};
	}
}
