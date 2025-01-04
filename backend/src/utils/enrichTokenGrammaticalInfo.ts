import {
	GoogleGenerativeAI,
	HarmBlockThreshold,
	HarmCategory,
	SchemaType,
} from '@google/generative-ai';
import {
	GrammaticalGender,
	GrammaticalNumber,
	GrammaticalPerson,
} from '../lib/types';
import {config} from 'dotenv';
import {ISentence} from '../../../lib/types';
import {
	ConjugationPattern,
	VerbClass,
	VerbMood,
	VerbRegularity,
	VerbTense,
	VerbVoice,
} from '../lib/grammaticalInfo/verbsTypes';
import {AdverbType} from '../lib/grammaticalInfo/adverbsTypes';
import {ArticleType} from '../lib/grammaticalInfo/articlesTypes';
import {
	ConjunctionFunction,
	ConjunctionType,
} from '../lib/grammaticalInfo/conjunctionsTypes';
import {DeterminerType} from '../lib/grammaticalInfo/determinersTypes';
import {
	InterjectionEmotion,
	InterjectionType,
} from '../lib/grammaticalInfo/interjectionsTypes';
import {NumeralType} from '../lib/grammaticalInfo/numeralsTypes';
import {
	ContractsWith,
	PrepositionType,
} from '../lib/grammaticalInfo/prepositionsTypes';
import {PronounCase, PronounType} from '../lib/grammaticalInfo/pronounsTypes';
config();

// TODO: cover with unit test

/**
 * Current Implementation Note:
 * We're using a hybrid approach to handle different token types due to Gemini AI's schema limitations:
 *
 * 1. Gemini AI Limitation:
 *    - Cannot properly handle polymorphic token structures
 *    - Schema validation doesn't support discriminated unions
 *    - Struggles with conditional property requirements based on token type
 *
 * 2. Our Solution:
 *    - Let Gemini AI process and enrich word tokens with linguistic analysis
 *    - Preserve original emoji and punctuation tokens from input
 *    - Post-process the response to merge both sources
 *
 * This approach maintains data integrity while working around current AI model constraints.
 * Future improvements may be possible as Gemini's schema capabilities evolve.
 */

const grammaticalNumberEnumValues = Object.values(GrammaticalNumber);
const grammaticalPersonEnumValues = Object.values(GrammaticalPerson);

const verbTenseEnumValues = Object.values(VerbTense);
const verbMoodEnumValues = Object.values(VerbMood);
const verbRegularityEnumValues = Object.values(VerbRegularity);
const verbVoiceEnumValues = Object.values(VerbVoice);
const verbConjugationPatternEnumValues = Object.values(ConjugationPattern);
const verbClassEnumValues = Object.values(VerbClass);

const grammaticalGenderEnumValues = Object.values(GrammaticalGender);

const adverbTypeEnumValues = Object.values(AdverbType);

const articleTypeEnumValues = Object.values(ArticleType);

const conjunctionTypeEnumValues = Object.values(ConjunctionType);
const conjunctionFunctionEnumValues = Object.values(ConjunctionFunction);

const determinersTypeEnumValues = Object.values(DeterminerType);

const interjectionTypeEnumValues = Object.values(InterjectionType);

const interjectionEmotionEnumValues = Object.values(InterjectionEmotion);

const numeralTypeEnumValues = Object.values(NumeralType);

const prepositionTypeEnumValues = Object.values(PrepositionType);
const contractsWithEnumValues = Object.values(ContractsWith);

const pronounTypeEnumValues = Object.values(PronounType);
const pronounCaseEnumValues = Object.values(PronounCase);

console.log('🚀 Initializing AI Text Processor');

const genAI = new GoogleGenerativeAI(
	process.env.GOOGLE_GENERATIVE_AI_KEY ?? '',
);

const sentenceSchema = {
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			sentenceId: {type: SchemaType.STRING},
			sentence: {type: SchemaType.STRING},
			translation: {type: SchemaType.STRING},
			literalTranslation: {type: SchemaType.STRING},
			tokens: {
				type: SchemaType.ARRAY,
				items: {
					type: SchemaType.OBJECT,
					properties: {
						content: {
							type: SchemaType.OBJECT,
							properties: {
								wordId: {type: SchemaType.STRING},
								spanish: {type: SchemaType.STRING},
								normalizedToken: {type: SchemaType.STRING},
								english: {type: SchemaType.STRING},
								hasSpecialChar: {type: SchemaType.BOOLEAN},
								partOfSpeech: {type: SchemaType.STRING},
								isSlang: {type: SchemaType.BOOLEAN},
								isCognate: {type: SchemaType.BOOLEAN},
								isFalseCognate: {type: SchemaType.BOOLEAN},
								grammaticalInfo: {
									type: SchemaType.OBJECT,
									properties: {
										// IVerb
										tense: {
											type: SchemaType.STRING,
											enum: verbTenseEnumValues,
										},
										mood: {type: SchemaType.STRING, enum: verbMoodEnumValues},
										person: {
											type: SchemaType.STRING,
											enum: grammaticalPersonEnumValues,
										},
										number: {
											type: SchemaType.STRING,
											enum: grammaticalNumberEnumValues,
										},
										isRegular: {type: SchemaType.BOOLEAN},
										infinitive: {type: SchemaType.STRING},
										conjugationPattern: {
											type: SchemaType.STRING,
											enum: verbConjugationPatternEnumValues,
										},
										voice: {
											type: SchemaType.STRING,
											enum: verbVoiceEnumValues,
										},
										verbClass: {
											type: SchemaType.STRING,
											enum: verbClassEnumValues,
										},
										gerund: {type: SchemaType.BOOLEAN},
										pastParticiple: {type: SchemaType.BOOLEAN},
										auxiliary: {
											type: SchemaType.STRING,
											enum: verbClassEnumValues,
										},
										verbRegularity: {
											type: SchemaType.STRING,
											enum: verbRegularityEnumValues,
										},
										isReflexive: {type: SchemaType.BOOLEAN},
										// IAdjective
										isPastParticiple: {type: SchemaType.BOOLEAN},
										// IAdverb
										adverbType: {
											type: SchemaType.STRING,
											enum: adverbTypeEnumValues,
										},
										usesMente: {type: SchemaType.BOOLEAN},
										// IArticle
										articleType: {
											type: SchemaType.STRING,
											enum: articleTypeEnumValues,
										},
										// IConjunction
										conjunctionType: {
											type: SchemaType.STRING,
											enum: conjunctionTypeEnumValues,
										},
										conjunctionFunction: {
											type: SchemaType.STRING,
											enum: conjunctionFunctionEnumValues,
										},
										/// IDeterminer
										determinersType: {
											type: SchemaType.STRING,
											enum: determinersTypeEnumValues,
										},
										// IInterjection
										interjectionType: {
											type: SchemaType.STRING,
											enum: interjectionTypeEnumValues,
										},
										interjectionEmotion: {
											type: SchemaType.STRING,
											enum: interjectionEmotionEnumValues,
										},
										// INoun
										gender: {
											type: SchemaType.STRING,
											enum: grammaticalGenderEnumValues,
										},
										isProperNoun: {type: SchemaType.BOOLEAN},
										diminutive: {type: SchemaType.BOOLEAN},
										// INumeral
										numeralType: {
											type: SchemaType.STRING,
											enum: numeralTypeEnumValues,
										},
										// IPreposition
										prepositionType: {
											type: SchemaType.STRING,
											enum: prepositionTypeEnumValues,
										},
										contractsWith: {
											type: SchemaType.STRING,
											enum: contractsWithEnumValues,
										},
										// IPronoun
										pronounType: {
											type: SchemaType.STRING,
											enum: pronounTypeEnumValues,
										},
										pronounCase: {
											type: SchemaType.STRING,
											enum: pronounCaseEnumValues,
										},
										isReciprocal: {type: SchemaType.BOOLEAN},
									},
								},
							},
							required: [
								'wordId',
								'spanish',
								'normalizedToken',
								'english',
								'hasSpecialChar',
								'partOfSpeech',
								'isSlang',
								'isCognate',
								'isFalseCognate',
								'grammaticalInfo',
							],
						},
						type: {
							type: SchemaType.STRING,
							enum: ['word', 'punctuationSign', 'emoji'],
						},
					},
					required: ['content', 'type'],
				},
			},
		},
		required: ['sentenceId', 'sentence', 'translation', 'tokens'],
	},
};

const model = genAI.getGenerativeModel({
	model: 'gemini-1.5-flash',
	generationConfig: {
		responseMimeType: 'application/json',
		responseSchema: sentenceSchema,
	},
	safetySettings: [
		{
			category: HarmCategory.HARM_CATEGORY_HARASSMENT,
			threshold: HarmBlockThreshold.BLOCK_NONE,
		},
		{
			category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
			threshold: HarmBlockThreshold.BLOCK_NONE,
		},
		{
			category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
			threshold: HarmBlockThreshold.BLOCK_NONE,
		},
		{
			category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
			threshold: HarmBlockThreshold.BLOCK_NONE,
		},
	],
});
export async function gramaticallyEnrichSentencesWithAI(
	sentences: ISentence[],
): Promise<ISentence[]> {
	console.log('\n📊 Input Statistics:', sentences.length);

	try {
		const prompt = {
			contents: [
				{
					role: 'user',
					parts: [
						{
							text: `Analyze and complete the grammatical properties for each word in these Spanish sentences:

Input Array: ${JSON.stringify(sentences)}

Task:
1. Each word token has a grammaticalInfo object with the correct structure based on its part of speech:

VERBS should include:
- tense (present, preterite, imperfect, etc.)
- mood (indicative, subjunctive, imperative)
- person (first, second, third)
- number (singular, plural)
- isRegular (true/false)
- infinitive (base form)
- conjugationPattern (-ar, -er, -ir)
- voice (active, passive)
- verbClass (transitive, intransitive, etc.)
- gerund (true/false)
- pastParticiple (true/false)
- isReflexive (true/false)

NOUNS should include:
- gender (masculine, feminine)
- number (singular, plural)
- isProperNoun (true/false)
- diminutive (true/false)

ADJECTIVES should include:
- gender (masculine, feminine)
- number (singular, plural)
- isPastParticiple (true/false)

ADVERBS should include:
- adverbType (manner, time, place, etc.)
- usesMente (true/false)

ARTICLES should include:
- articleType (definite, indefinite)
- gender (masculine, feminine)
- number (singular, plural)

PRONOUNS should include:
- pronounType (personal, demonstrative, etc.)
- pronounCase (nominative, accusative, etc.)
- gender (masculine, feminine)
- number (singular, plural)
- person (first, second, third)
- isReciprocal (true/false)

PREPOSITIONS should include:
- prepositionType (simple, compound)
- contractsWith (article, pronoun)

CONJUNCTIONS should include:
- conjunctionType (coordinating, subordinating)
- conjunctionFunction (additive, adversative, etc.)

DETERMINERS should include:
- determinersType (demonstrative, possessive, etc.)
- gender (masculine, feminine)
- number (singular, plural)

INTERJECTIONS should include:
- interjectionType (emotional, onomatopoeic)
- interjectionEmotion (joy, surprise, etc.)

NUMERALS should include:
- numeralType (cardinal, ordinal, etc.)
- gender (masculine, feminine)
- number (singular, plural)

2. Fill in all empty properties of the grammaticalInfo object with the appropriate grammatical values
3. Keep all existing properties and structure intact while providing accurate grammatical analysis for Spanish language rules.`,
						},
					],
				},
			],
		};

		const result = await model.generateContent(prompt);
		const response = await result.response.text();
		let enrichedBatch = JSON.parse(response);

		if (!Array.isArray(enrichedBatch)) {
			enrichedBatch = [enrichedBatch];
		}

		const processedSentences = enrichedBatch.map(
			(enrichedSentence: {tokens: any[]}, sentenceIndex: number) => {
				const originalSentence = sentences[sentenceIndex];

				const correctedTokens = enrichedSentence.tokens.map(
					(token: any, tokenIndex: number) => {
						const originalToken = originalSentence.tokens[tokenIndex];

						if (
							originalToken.type === 'emoji' ||
							originalToken.type === 'punctuationSign'
						) {
							return originalToken;
						}

						return token;
					},
				);

				return {
					...enrichedSentence,
					tokens: correctedTokens,
				};
			},
		);

		console.log('✅ Processing completed\n');
		return processedSentences;
	} catch (error) {
		console.error('❌ Error:', error);
		throw error;
	}
}
