import {ContentInstructionFactory} from '../ContentInstructionsFactory';
import {ContentType} from '@bocaditosespanol/shared';

describe('ContentInstructionFactory', () => {
	it('should create song instruction', () => {
		const instruction = ContentInstructionFactory.createInstruction(
			ContentType.SONG,
		);
		expect(instruction).toContain('Linguistic Analysis Task for Song Lyrics');
		expect(instruction).toContain('CRITICAL REQUIREMENTS');
		expect(instruction).toContain('STRICT PROCESSING RULES');
	});

	it('should throw error for unsupported content type', () => {
		const invalidType = 'invalid' as ContentType;
		expect(() => {
			ContentInstructionFactory.createInstruction(invalidType);
		}).toThrow('Unsupported content type: invalid');
	});

	it('should include array processing requirements in song instruction', () => {
		const instruction = ContentInstructionFactory.createInstruction(
			ContentType.SONG,
		);
		expect(instruction).toContain('MUST return an ARRAY');
		expect(instruction).toContain(
			'EXACTLY the same number of processed sentences',
		);
		expect(instruction).toContain('maintain its original position');
	});
	it('should include translation requirements in song instruction', () => {
		const instruction = ContentInstructionFactory.createInstruction(
			ContentType.SONG,
		);
		expect(instruction).toContain('English contextual translation');
		expect(instruction).toContain('literal word-for-word translation');
		expect(instruction).toContain("Consider the artist's dialect");
	});
});
