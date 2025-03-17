import {
	AdverbType,
	ArticleType,
	ConjunctionFunction,
	ConjunctionType,
	ContractsWith,
	DeterminerType,
	InterjectionEmotion,
	InterjectionType,
	NumeralType,
	PrepositionType,
	PronounCase,
	PronounType,
	VerbClass,
	VerbMood,
	VerbRegularity,
	VerbTense,
	VerbVoice,
} from '@/lib/types/partsOfSpeech';
import {
	GrammaticalGender,
	GrammaticalNumber,
	GrammaticalPerson,
} from '@/lib/types/common';

const posInstructions: Record<
	string,
	{name: string; references: string[]; extra?: string}
> = {
	adjective: {
		name: 'Spanish Adjective Analysis Task',
		references: [
			`Gender: Possible values: ${Object.values(GrammaticalGender).join(', ')}`,
			`Number: Possible values: ${Object.values(GrammaticalNumber).join(', ')}`,
			`Past Participle: Indicate if it's being used as a past participle`,
		],
		extra:
			'Consider context and all possible interpretations for ambiguous cases.',
	},
	noun: {
		name: 'Spanish Noun Analysis Task',
		references: [
			`Gender: Possible values: ${Object.values(GrammaticalGender).join(', ')}`,
			`Number: Possible values: ${Object.values(GrammaticalNumber).join(', ')}`,
			`Proper Noun: Indicate if it's a proper noun`,
			`Diminutive: Indicate if it's in diminutive form`,
		],
		extra:
			'Consider context and all possible interpretations for ambiguous cases.',
	},
	verb: {
		name: 'Spanish Verb Analysis Task',
		references: [
			`Tense: Possible values include: ${Object.values(VerbTense).join(', ')}`,
			`Mood: Possible values include: ${Object.values(VerbMood).join(', ')}`,
			`Person: Possible values include: ${Object.values(GrammaticalPerson).join(
				', ',
			)}`,
			`Number: Possible values include: ${Object.values(GrammaticalNumber).join(
				', ',
			)}`,
			`Regularity: Possible values include: ${Object.values(
				VerbRegularity,
			).join(', ')}`,
			`Infinitive: Provide the infinitive form of the verb.`,
			`Voice: Possible values include: ${Object.values(VerbVoice).join(', ')}`,
			`Verb Class: Possible values include: ${Object.values(VerbClass).join(
				', ',
			)}`,
			`Gerund and Past Participle: Specify if the verb can be used as a gerund or past participle.`,
			`Reflexivity: Indicate if the verb is reflexive.`,
		],
		extra:
			'Ensure that all possible interpretations of the verb are considered, especially in ambiguous cases.',
	},
	adverb: {
		name: 'Spanish Adverb Analysis Task',
		references: [
			`Adverb Type: Specify the type. Possible values: ${Object.values(
				AdverbType,
			).join(', ')}`,
			`Mente Usage: Indicate if it ends in -mente`,
		],
		extra:
			'Consider context and all possible interpretations for ambiguous cases.',
	},
	article: {
		name: 'Spanish Article Analysis Task',
		references: [
			`Article Type: Specify if definite or indefinite. Possible values: ${Object.values(
				ArticleType,
			).join(', ')}`,
			`Gender: Possible values: ${Object.values(GrammaticalGender).join(', ')}`,
			`Number: Possible values: ${Object.values(GrammaticalNumber).join(', ')}`,
		],
		extra:
			'Consider context and all possible interpretations for ambiguous cases.',
	},
	numeral: {
		name: 'Spanish Numeral Analysis Task',
		references: [
			`Numeral Type: Specify the type. Possible values: ${Object.values(
				NumeralType,
			).join(', ')}`,
			`Gender: Possible values: ${Object.values(GrammaticalGender).join(', ')}`,
			`Number: Possible values: ${Object.values(GrammaticalNumber).join(', ')}`,
		],
		extra: '',
	},
	pronoun: {
		name: 'Spanish Pronoun Analysis Task',
		references: [
			`Pronoun Type: Possible values: ${Object.values(PronounType).join(', ')}`,
			`Person: Possible values: ${Object.values(GrammaticalPerson).join(', ')}`,
			`Gender: Possible values: ${Object.values(GrammaticalGender).join(', ')}`,
			`Number: Possible values: ${Object.values(GrammaticalNumber).join(', ')}`,
			`Case: Possible values: ${Object.values(PronounCase).join(', ')}`,
			`Reflexive: Indicate if it's reflexive`,
			`Reciprocal: Indicate if it's reciprocal`,
		],
		extra: '',
	},
	determiner: {
		name: 'Spanish Determiner Analysis Task',
		references: [
			`Determiner Type: Specify the type. Possible values: ${Object.values(
				DeterminerType,
			).join(', ')}`,
			`Gender: Possible values: ${Object.values(GrammaticalGender).join(', ')}`,
			`Number: Possible values: ${Object.values(GrammaticalNumber).join(', ')}`,
		],
		extra: '',
	},
	conjunction: {
		name: 'Spanish Conjunction Analysis Task',
		references: [
			`Conjunction Type: Possible values: ${Object.values(ConjunctionType).join(
				', ',
			)}`,
			`Conjunction Function: Possible values: ${Object.values(
				ConjunctionFunction,
			).join(', ')}`,
		],
		extra:
			'Consider context and all possible interpretations for ambiguous cases.',
	},
	preposition: {
		name: 'Spanish Preposition Analysis Task',
		references: [
			`Preposition Type: Possible values: ${Object.values(PrepositionType).join(
				', ',
			)}`,
			`Contracts With: Possible values: ${Object.values(ContractsWith).join(
				', ',
			)}`,
		],
		extra: '',
	},
	interjection: {
		name: 'Spanish Interjection Analysis Task',
		references: [
			`Emotion: Possible values: ${Object.values(InterjectionEmotion).join(
				', ',
			)}`,
			`Type: Possible values: ${Object.values(InterjectionType).join(', ')}`,
		],
		extra: '',
	},
};

function buildInstruction(posKey: keyof typeof posInstructions): string {
	const {name, references, extra} = posInstructions[posKey];
	const referencesBulletList = references
		.map(item => `      - ${item}`)
		.join('\n');

	return `
      ${name}: Analyze each ${posKey} and return the enriched ${posKey} tokens array.
      For each ${posKey}, provide detailed information including:
${referencesBulletList}
      ${extra}
  `;
}

export class SystemInstructionFactory {
	static createAdjectiveInstruction() {
		return buildInstruction('adjective');
	}

	static createNounInstruction() {
		return buildInstruction('noun');
	}

	static createVerbInstruction() {
		return buildInstruction('verb');
	}

	static createAdverbInstruction() {
		return buildInstruction('adverb');
	}

	static createArticleInstruction() {
		return buildInstruction('article');
	}

	static createNumeralInstruction() {
		return buildInstruction('numeral');
	}

	static createPronounInstruction() {
		return buildInstruction('pronoun');
	}

	static createDeterminerInstruction() {
		return buildInstruction('determiner');
	}

	static createConjunctionInstruction() {
		return buildInstruction('conjunction');
	}

	static createPrepositionInstruction() {
		return buildInstruction('preposition');
	}

	static createInterjectionInstruction() {
		return buildInstruction('interjection');
	}
}
