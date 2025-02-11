import {SchemaType} from '@google/generative-ai';
import {ContentType} from '@bocaditosespanol/shared';
import {ContentSchemaFactory} from '../ContentSchemaFactory';

describe('ContentSchemaFactory', () => {
	describe('createSchema', () => {
		it('should create valid song schema with all required properties', () => {
			const schema = ContentSchemaFactory.createSchema(ContentType.SONG);

			expect(schema.type).toBe(SchemaType.ARRAY);
			expect(schema.items.type).toBe(SchemaType.OBJECT);
			expect(schema.items.required).toEqual([
				'sentenceId',
				'content',
				'translations',
				'tokenIds',
			]);
		});

		it('should create song schema with correct translations structure', () => {
			const schema = ContentSchemaFactory.createSchema(ContentType.SONG);
			const translations = schema.items.properties.translations;

			expect(translations.type).toBe(SchemaType.OBJECT);
			expect(translations.properties.english.required).toEqual([
				'literal',
				'contextual',
			]);
			expect(translations.required).toEqual(['english']);
		});

		it('should create song schema with correct token array structure', () => {
			const schema = ContentSchemaFactory.createSchema(ContentType.SONG);
			const tokenIds = schema.items.properties.tokenIds;

			expect(tokenIds.type).toBe(SchemaType.ARRAY);
			expect(tokenIds.items.type).toBe(SchemaType.STRING);
		});

		it('should throw error for undefined content type', () => {
			expect(() => {
				ContentSchemaFactory.createSchema(undefined as unknown as ContentType);
			}).toThrow('Unsupported content type: undefined');
		});

		it('should throw error for null content type', () => {
			expect(() => {
				ContentSchemaFactory.createSchema(null as unknown as ContentType);
			}).toThrow('Unsupported content type: null');
		});
	});
});
