import {
	AdverbType,
	ArticleType,
	ConjunctionFunction,
	ConjunctionType,
	ContractsWith,
	DeterminerType,
	GrammaticalGender,
	GrammaticalNumber,
	GrammaticalPerson,
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
} from '@bocaditosespanol/shared';

export class SystemInstructionFactory {
	static createAdjectiveInstruction() {
		return `
      Spanish Adjective Analysis Task: Analyze each adjective and return the enriched adjective tokens array.
      For each adjective, provide detailed grammatical information including:
      - Gender: Possible values: ${Object.values(GrammaticalGender).join(', ')}
      - Number: Possible values: ${Object.values(GrammaticalNumber).join(', ')}
      - Past Participle: Indicate if it's being used as a past participle
      Consider context and all possible interpretations for ambiguous cases.
    `;
	}

	static createNounInstruction() {
		return `
      Spanish Noun Analysis Task: Analyze each noun and return the enriched noun tokens array.
      For each noun, provide detailed grammatical information including:
      - Gender: Possible values: ${Object.values(GrammaticalGender).join(', ')}
      - Number: Possible values: ${Object.values(GrammaticalNumber).join(', ')}
      - Proper Noun: Indicate if it's a proper noun
      - Diminutive: Indicate if it's in diminutive form
      Consider context and all possible interpretations for ambiguous cases.
    `;
	}

	static createVerbInstruction() {
		return `
      Spanish Verb Analysis Task: Analyze each of the verbs and return the enriched verb tokens array.
      For each verb, provide detailed grammatical information including:
      - Tense: Identify all possible tenses the verb can be in. Possible values include: ${Object.values(VerbTense).join(', ')}.
      - Mood: Specify the mood of the verb. Possible values include: ${Object.values(VerbMood).join(', ')}.
      - Person: List all possible grammatical persons the verb can represent. Possible values include: ${Object.values(GrammaticalPerson).join(', ')}.
      - Number: Specify whether the verb is singular or plural. Possible values include: ${Object.values(GrammaticalNumber).join(', ')}.
      - Regularity: Indicate if the verb is regular or irregular. Possible values include: ${Object.values(VerbRegularity).join(', ')}.
      - Infinitive: Provide the infinitive form of the verb.
      - Voice: Specify the voice (e.g., active, passive). Possible values include: ${Object.values(VerbVoice).join(', ')}.
      - Verb Class: Indicate the class of the verb. Possible values include: ${Object.values(VerbClass).join(', ')}.
      - Gerund and Past Participle: Specify if the verb can be used as a gerund or past participle.
      - Reflexivity: Indicate if the verb is reflexive.
      Ensure that all possible interpretations of the verb are considered, especially in ambiguous cases.
    `;
	}

	static createAdverbInstruction() {
		return `
      Spanish Adverb Analysis Task: Analyze each adverb and return the enriched adverb tokens array.
      For each adverb, provide detailed grammatical information including:
      - Adverb Type: Specify the type. Possible values: ${Object.values(AdverbType).join(', ')}
      - Mente Usage: Indicate if it ends in -mente
      Consider context and all possible interpretations for ambiguous cases.
    `;
	}

	static createArticleInstruction() {
		return `
      Spanish Article Analysis Task: Analyze each article and return the enriched article tokens array.
      For each article, provide detailed grammatical information including:
      - Article Type: Specify if definite or indefinite. Possible values: ${Object.values(ArticleType).join(', ')}
      - Gender: Specify grammatical gender. Possible values: ${Object.values(GrammaticalGender).join(', ')}
      - Number: Specify if singular or plural. Possible values: ${Object.values(GrammaticalNumber).join(', ')}
      Consider context and all possible interpretations for ambiguous cases.
    `;
	}

	static createNumeralInstruction() {
		return `
      Spanish Numeral Analysis Task: Analyze each numeral and return the enriched numeral tokens array.
      For each numeral, provide detailed information including:
      - Numeral Type: Specify the type. Possible values: ${Object.values(NumeralType).join(', ')}
      - Gender: Specify grammatical gender if applicable. Possible values: ${Object.values(GrammaticalGender).join(', ')}
      - Number: Specify if singular or plural if applicable. Possible values: ${Object.values(GrammaticalNumber).join(', ')}
    `;
	}

	static createPronounInstruction() {
		return `
      Spanish Pronoun Analysis Task: Analyze each pronoun and return the enriched pronoun tokens array.
      For each pronoun, provide detailed information including:
      - Pronoun Type: Specify the type. Possible values: ${Object.values(PronounType).join(', ')}
      - Person: Specify grammatical person. Possible values: ${Object.values(GrammaticalPerson).join(', ')}
      - Gender: Specify grammatical gender. Possible values: ${Object.values(GrammaticalGender).join(', ')}
      - Number: Specify if singular or plural. Possible values: ${Object.values(GrammaticalNumber).join(', ')}
      - Case: Specify the case. Possible values: ${Object.values(PronounCase).join(', ')}
      - Reflexive: Indicate if it's reflexive
      - Reciprocal: Indicate if it's reciprocal
    `;
	}

	static createDeterminerInstruction() {
		return `
      Spanish Determiner Analysis Task: Analyze each determiner and return the enriched determiner tokens array.
      For each determiner, provide detailed grammatical information including:
      - Determiner Type: Specify the type. Possible values: ${Object.values(DeterminerType).join(', ')}
      - Gender: Specify grammatical gender. Possible values: ${Object.values(GrammaticalGender).join(', ')}
      - Number: Specify if singular or plural. Possible values: ${Object.values(GrammaticalNumber).join(', ')}
    `;
	}

	static createConjunctionInstruction() {
		return `
      Spanish Conjunction Analysis Task: Analyze each conjunction and return the enriched conjunction tokens array.
      For each conjunction, provide detailed grammatical information including:
      - Conjunction Type: Specify if coordinating or subordinating. Possible values: ${Object.values(ConjunctionType).join(', ')}
      - Conjunction Function: Specify the function. Possible values: ${Object.values(ConjunctionFunction).join(', ')}
      Consider context and all possible interpretations for ambiguous cases.
    `;
	}

	static createPrepositionInstruction() {
		return `
      Spanish Preposition Analysis Task: Analyze each preposition and return the enriched preposition tokens array.
      For each preposition, provide detailed information including:
      - Preposition Type: Specify if simple, compound, or locution. Possible values: ${Object.values(PrepositionType).join(', ')}
      - Contracts With: Specify if it contracts with articles or pronouns. Possible values: ${Object.values(ContractsWith).join(', ')}
    `;
	}

	static createInterjectionInstruction() {
		return `
      Spanish Interjection Analysis Task: Analyze each interjection and return the enriched interjection tokens array.
      For each interjection, provide detailed information including:
      - Emotion: Specify the emotion expressed. Possible values: ${Object.values(InterjectionEmotion).join(', ')}
      - Type: Specify the type. Possible values: ${Object.values(InterjectionType).join(', ')}
    `;
	}
}
