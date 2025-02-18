import {SystemInstructionFactory} from '../GrammaticalEnrichmentSystemInstructionsFactory';

describe('SystemInstructionFactory', () => {
	it('should create an adjective instruction', () => {
		const instruction = SystemInstructionFactory.createAdjectiveInstruction();
		expect(instruction).toContain('Spanish Adjective Analysis Task');
	});

	it('should create a noun instruction', () => {
		const instruction = SystemInstructionFactory.createNounInstruction();
		expect(instruction).toContain('Spanish Noun Analysis Task');
	});

	it('should create a verb instruction', () => {
		const instruction = SystemInstructionFactory.createVerbInstruction();
		expect(instruction).toContain('Spanish Verb Analysis Task');
	});

	it('should create an adverb instruction', () => {
		const instruction = SystemInstructionFactory.createAdverbInstruction();
		expect(instruction).toContain('Spanish Adverb Analysis Task');
	});

	it('should create an article instruction', () => {
		const instruction = SystemInstructionFactory.createArticleInstruction();
		expect(instruction).toContain('Spanish Article Analysis Task');
	});

	it('should create a numeral instruction', () => {
		const instruction = SystemInstructionFactory.createNumeralInstruction();
		expect(instruction).toContain('Spanish Numeral Analysis Task');
	});

	it('should create a pronoun instruction', () => {
		const instruction = SystemInstructionFactory.createPronounInstruction();
		expect(instruction).toContain('Spanish Pronoun Analysis Task');
	});

	it('should create a determiner instruction', () => {
		const instruction = SystemInstructionFactory.createDeterminerInstruction();
		expect(instruction).toContain('Spanish Determiner Analysis Task');
	});

	it('should create a conjunction instruction', () => {
		const instruction = SystemInstructionFactory.createConjunctionInstruction();
		expect(instruction).toContain('Spanish Conjunction Analysis Task');
	});

	it('should create a preposition instruction', () => {
		const instruction = SystemInstructionFactory.createPrepositionInstruction();
		expect(instruction).toContain('Spanish Preposition Analysis Task');
	});

	it('should create an interjection instruction', () => {
		const instruction =
			SystemInstructionFactory.createInterjectionInstruction();
		expect(instruction).toContain('Spanish Interjection Analysis Task');
	});
});
