import {SchemaType} from '@google/generative-ai';
import {PartOfSpeechSchemaFactory} from '../GrammaticalEnrichmentSchemaFactory';
import {
	ContractsWith,
	InterjectionEmotion,
	InterjectionType,
	PrepositionType,
	PronounCase,
	PronounType,
	VerbMood,
	VerbTense,
	VerbClass,
	VerbRegularity,
	VerbVoice,
} from '@bocaditosespanol/shared';

describe('PartOfSpeechSchemaFactory', () => {
	describe('createAdjectiveSchema', () => {
		it('should create schema with default properties', () => {
			const schema = PartOfSpeechSchemaFactory.createAdjectiveSchema();
			expect(schema.type).toBe(SchemaType.ARRAY);
			expect(schema.items.properties.grammaticalInfo.properties).toHaveProperty(
				'gender',
			);
			expect(schema.items.properties.grammaticalInfo.properties).toHaveProperty(
				'number',
			);
			expect(schema.items.properties.grammaticalInfo.properties).toHaveProperty(
				'isPastParticiple',
			);
		});

		it('should create schema with custom properties', () => {
			const schema = PartOfSpeechSchemaFactory.createAdjectiveSchema({
				gender: true,
				number: false,
			});
			expect(schema.items.properties.grammaticalInfo.properties).toHaveProperty(
				'gender',
			);
			expect(
				schema.items.properties.grammaticalInfo.properties,
			).not.toHaveProperty('number');
		});
	});

	describe('createVerbSchema', () => {
		it('should include all verb-specific enums', () => {
			const schema = PartOfSpeechSchemaFactory.createVerbSchema();
			const props = schema.items.properties.grammaticalInfo.properties;

			expect(props.tense.items.enum).toEqual(Object.values(VerbTense));
			expect(props.mood.enum).toEqual(Object.values(VerbMood));
			expect(props.voice.enum).toEqual(Object.values(VerbVoice));
			expect(props.verbClass.enum).toEqual(Object.values(VerbClass));
			expect(props.verbRegularity.enum).toEqual(Object.values(VerbRegularity));
		});
	});

	describe('createPronounSchema', () => {
		it('should include all pronoun-specific properties', () => {
			const schema = PartOfSpeechSchemaFactory.createPronounSchema();
			const props = schema.items.properties.grammaticalInfo.properties;

			expect(props.pronounType.enum).toEqual(Object.values(PronounType));
			expect(props.case.enum).toEqual(Object.values(PronounCase));
			expect(props).toHaveProperty('isReflexive');
			expect(props).toHaveProperty('isReciprocal');
		});
	});

	describe('createPrepositionSchema', () => {
		it('should create valid preposition schema', () => {
			const schema = PartOfSpeechSchemaFactory.createPrepositionSchema();
			const props = schema.items.properties.grammaticalInfo.properties;

			expect(props.prepositionType.enum).toEqual(
				Object.values(PrepositionType),
			);
			expect(props.contractsWith.enum).toEqual(Object.values(ContractsWith));
		});
	});

	describe('createInterjectionSchema', () => {
		it('should create valid interjection schema', () => {
			const schema = PartOfSpeechSchemaFactory.createInterjectionSchema();
			const props = schema.items.properties.grammaticalInfo.properties;

			expect(props.interjectionEmotion.enum).toEqual(
				Object.values(InterjectionEmotion),
			);
			expect(props.interjectionType.enum).toEqual(
				Object.values(InterjectionType),
			);
		});
	});

	describe('createNounSchema', () => {
		it('should create schema with custom noun properties', () => {
			const schema = PartOfSpeechSchemaFactory.createNounSchema({
				isProperNoun: true,
				diminutive: true,
				gender: false,
				number: false,
			});
			const props = schema.items.properties.grammaticalInfo.properties;

			expect(props).toHaveProperty('isProperNoun');
			expect(props).toHaveProperty('diminutive');
			expect(props).not.toHaveProperty('gender');
			expect(props).not.toHaveProperty('number');
		});
	});
});
