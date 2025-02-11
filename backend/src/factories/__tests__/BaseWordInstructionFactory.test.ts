import {BaseWordInstructionFactory} from '../BaseWordInstructionFactory';
import {PartOfSpeech} from '@bocaditosespanol/shared';

describe('BaseWordInstructionFactory', () => {
	it('should create instruction with all parts of speech', () => {
		const instruction = BaseWordInstructionFactory.createInstruction();
		const allPartsOfSpeech = Object.values(PartOfSpeech).join(', ');
		expect(instruction).toContain(allPartsOfSpeech);
	});

	it('should include translation rules', () => {
		const instruction = BaseWordInstructionFactory.createInstruction();
		expect(instruction).toContain('Translation Rules');
		expect(instruction).toContain('commonly accepted dictionary meanings');
		expect(instruction).toContain('do not prepend pronouns');
		expect(instruction).toContain('regional variations');
	});

	it('should specify special classification criteria', () => {
		const instruction = BaseWordInstructionFactory.createInstruction();
		expect(instruction).toContain('≥75% spelling overlap');
		expect(instruction).toContain('isSlang');
		expect(instruction).toContain('isCognate');
		expect(instruction).toContain('isFalseCognate');
	});

	it('should include format requirements', () => {
		const instruction = BaseWordInstructionFactory.createInstruction();
		expect(instruction).toContain('exact schema structure');
		expect(instruction).toContain('process ALL input tokens');
		expect(instruction).toContain('Preserve original token order');
	});

	it('should specify linguistic expertise requirements', () => {
		const instruction = BaseWordInstructionFactory.createInstruction();
		expect(instruction).toContain(
			'bilingual Spanish-English linguistic expert',
		);
		expect(instruction).toContain('grammar');
		expect(instruction).toContain('vocabulary');
		expect(instruction).toContain('idiomatic expressions');
	});
});
