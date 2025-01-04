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
							text: `Linguistic Analysis Task for Spanish-English Learning:

Input Array: ${JSON.stringify(sentences)}

CRITICAL REQUIREMENTS:
1. MUST return an ARRAY with EXACTLY ${sentences.length} processed sentences
2. Each sentence must maintain its original position in the array
3. Process ALL sentences

STRICT PROCESSING RULES:
1. OUTPUT MUST BE AN ARRAY of processed sentences
2. ONLY for VERB TOKENS ADD ALL THE grammaticalInformation according to the following interfaces and enums:

	a) If the partOfSpeech is a VERB:

    - add to the grammaticalInfo property an exact obejct with the interface IVerb (see references below)
    - complete all the properties of the IVerb interface with the corresponding information (see the enums on references)

    *** References

        interface IVerb {
            tense: VerbTense;
            mood: VerbMood;
            person: GrammaticalPerson;
            number: GrammaticalNumber;
            isRegular: boolean;
            infinitive: string;
            conjugationPattern: ConjugationPattern;
            voice: VerbVoice;
            verbClass: VerbClass;
            gerund: boolean;
            pastParticiple: boolean;
            auxiliary: VerbAuxiliary;
            verbRegularity: VerbRegularity;
            isReflexive: boolean;
        }

        enum VerbTense {
            Present = 'present',
            PresentPerfect = 'presentPerfect',
            Imperfect = 'imperfect',
            Preterite = 'preterite',
            PastPerfect = 'pastPerfect',
            Future = 'future',
            FuturePerfect = 'futurePerfect',
            Conditional = 'conditional',
            ConditionalPerfect = 'conditionalPerfect',

            SubjunctivePresent = 'subjunctivePresent',
            SubjunctivePerfect = 'subjunctivePerfect',
            SubjunctiveImperfect = 'subjunctiveImperfect',
            SubjunctivePastPerfect = 'subjunctivePastPerfect',
            SubjunctiveFuture = 'subjunctiveFuture',
            SubjunctiveFuturePerfect = 'subjunctiveFuturePerfect',
        }


        enum VerbTense {
            Present = 'present',
            PresentPerfect = 'presentPerfect',
            Imperfect = 'imperfect',
            Preterite = 'preterite',
            PastPerfect = 'pastPerfect',
            Future = 'future',
            FuturePerfect = 'futurePerfect',
            Conditional = 'conditional',
            ConditionalPerfect = 'conditionalPerfect',

            SubjunctivePresent = 'subjunctivePresent',
            SubjunctivePerfect = 'subjunctivePerfect',
            SubjunctiveImperfect = 'subjunctiveImperfect',
            SubjunctivePastPerfect = 'subjunctivePastPerfect',
            SubjunctiveFuture = 'subjunctiveFuture',
            SubjunctiveFuturePerfect = 'subjunctiveFuturePerfect',
        }

        enum VerbMood {
            Indicative = 'indicative',
            Subjunctive = 'subjunctive',
            Imperative = 'imperative',
            Infinitive = 'infinitive',
            Gerund = 'gerund',
            Participle = 'participle',
        }

        enum VerbRegularity {
            Regular = 'regular',
            IrregularStem = 'stemChange',
            IrregularAll = 'irregular',
        }

        enum VerbVoice {
            Active = 'active',
            Passive = 'passive',
        }

        enum VerbClass {
            Transitive = 'transitive',
            Intransitive = 'intransitive',
            Pronominal = 'pronominal',
            Copulative = 'copulative',
            Impersonal = 'impersonal',
        }

        enum VerbAuxiliary {
            Haber = 'haber',
            Ser = 'ser',
            Estar = 'estar',
        }

        enum ConjugationPattern {
            AR = 'ar',
            ER = 'er',
            IR = 'ir',

            E_IE = 'e->ie',
            O_UE = 'o->ue',
            E_I = 'e->i',
            U_UE = 'u->ue',
            I_IE = 'i->ie',

            IRREGULAR = 'irregular',
            G_ADDITION = 'g-add',
            C_ZC = 'c->zc',
            I_Y = 'i->y',

            IR_E_I = 'ir_e->i',
            ER_O_UE = 'er_o->ue',
            AR_E_IE = 'ar_e->ie',
        }


    - enrich all the properties witht their corresponden information


Generate response as an array of fully processed sentences.`,
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
