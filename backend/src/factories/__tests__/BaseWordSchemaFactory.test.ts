import {SchemaType} from '@google/generative-ai';
import {TokenType, PartOfSpeech} from '@bocaditosespanol/shared';
import {BaseWordSchemaFactory} from '../TokenAIEnrichmentFactory';

describe('BaseWordSchemaFactory', () => {
	describe('createSchema', () => {
		it('should create schema with correct array and object structure', () => {
			const schema = BaseWordSchemaFactory.createSchema();

			expect(schema.type).toBe(SchemaType.ARRAY);
			expect(schema.items.type).toBe(SchemaType.OBJECT);
		});

		it('should include all required properties in schema', () => {
			const schema = BaseWordSchemaFactory.createSchema();

			expect(schema.items.required).toEqual([
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
			]);
		});

		it('should define correct translations structure', () => {
			const schema = BaseWordSchemaFactory.createSchema();
			const translations = schema.items.properties.translations;

			expect(translations.type).toBe(SchemaType.OBJECT);
			expect(translations.properties.english.type).toBe(SchemaType.ARRAY);
			expect(translations.properties.english.items.type).toBe(
				SchemaType.STRING,
			);
		});

		it('should define correct enum values for tokenType', () => {
			const schema = BaseWordSchemaFactory.createSchema();
			const tokenType = schema.items.properties.tokenType;

			expect(tokenType.type).toBe(SchemaType.STRING);
			expect(tokenType.enum).toEqual([TokenType.Word]);
		});

		it('should define correct enum values for partOfSpeech', () => {
			const schema = BaseWordSchemaFactory.createSchema();
			const partOfSpeech = schema.items.properties.partOfSpeech;

			expect(partOfSpeech.type).toBe(SchemaType.STRING);
			expect(partOfSpeech.enum).toEqual(Object.values(PartOfSpeech));
		});

		it('should define boolean type for flag properties', () => {
			const schema = BaseWordSchemaFactory.createSchema();

			expect(schema.items.properties.hasSpecialChar.type).toBe(
				SchemaType.BOOLEAN,
			);
			expect(schema.items.properties.isSlang.type).toBe(SchemaType.BOOLEAN);
			expect(schema.items.properties.isCognate.type).toBe(SchemaType.BOOLEAN);
			expect(schema.items.properties.isFalseCognate.type).toBe(
				SchemaType.BOOLEAN,
			);
		});
	});
});
