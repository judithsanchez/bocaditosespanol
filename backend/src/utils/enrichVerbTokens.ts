import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {config} from 'dotenv';
import {geminiSafetySettings} from '../lib/constants';
import {
	VerbClass,
	VerbMood,
	VerbRegularity,
	VerbTense,
	VerbVoice,
} from '../lib/grammaticalInfo/verbsTypes';
import {GrammaticalNumber, GrammaticalPerson, IWord} from '../lib/types';
config();

// TODO: cover with unit test
// TODO: figure out why the cognates are not being handled correctly

console.log('🚀 Initializing AI Text Processor');

const genAI = new GoogleGenerativeAI(
	process.env.GOOGLE_GENERATIVE_AI_KEY ?? '',
);

export const verbTokenSchema = {
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			tokenId: {type: SchemaType.STRING},
			originalText: {type: SchemaType.STRING},
			grammaticalInfo: {
				type: SchemaType.OBJECT,
				properties: {
					tense: {
						type: SchemaType.ARRAY,
						items: {
							type: SchemaType.STRING,
							enum: Object.values(VerbTense),
						},
					},
					mood: {type: SchemaType.STRING, enum: Object.values(VerbMood)},
					person: {
						type: SchemaType.ARRAY,
						items: {type: SchemaType.STRING},
					},
					number: {type: SchemaType.STRING},
					isRegular: {type: SchemaType.BOOLEAN},
					infinitive: {type: SchemaType.STRING},
					// conjugationPattern: {
					// 	type: SchemaType.ARRAY,
					// 	items: {
					// 		type: SchemaType.STRING,
					// 		enum: Object.values(ConjugationPattern),
					// 	},
					// },
					voice: {type: SchemaType.STRING, enum: Object.values(VerbVoice)},
					verbClass: {type: SchemaType.STRING, enum: Object.values(VerbClass)},
					gerund: {type: SchemaType.BOOLEAN},
					pastParticiple: {type: SchemaType.BOOLEAN},
					verbRegularity: {
						type: SchemaType.STRING,
						enum: Object.values(VerbRegularity),
					},
					isReflexive: {type: SchemaType.BOOLEAN},
				},
				required: [
					'tense',
					'mood',
					'person',
					'number',
					'isRegular',
					'infinitive',
					// 'conjugationPattern',
					'voice',
					'verbClass',
					'gerund',
					'pastParticiple',
					'verbRegularity',
					'isReflexive',
				],
			},
		},
		required: ['tokenId', 'originalText', 'grammaticalInfo'],
	},
};
export async function enrichVerbTokens(
	tokens: Pick<IWord, 'tokenId' | 'originalText' | 'grammaticalInfo'>[],
): Promise<Pick<IWord, 'tokenId' | 'originalText' | 'grammaticalInfo'>[]> {
	console.log('� Processing verb tokens:', tokens.length);

	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash',
		generationConfig: {
			responseMimeType: 'application/json',
			responseSchema: verbTokenSchema,
		},
		systemInstruction: `
			Spanish Verb Analysis Task: Analyze each of the verbs and return the enriched verb tokens array.
			For each verb, provide detailed grammatical information including:
			- Tense: Identify all possible tenses the verb can be in. Possible values include: ${Object.values(
				VerbTense,
			).join(', ')}.
			- Mood: Specify the mood of the verb. Possible values include: ${Object.values(
				VerbMood,
			).join(', ')}.
			- Person: List all possible grammatical persons (e.g., first, second, third) the verb can represent. 
			  For example, if the verb is "estaba," it should include both first and third person. Possible values include: ${Object.values(
					GrammaticalPerson,
				).join(', ')}.
			- Number: Specify whether the verb is singular or plural. Possible values include: ${Object.values(
				GrammaticalNumber,
			).join(', ')}.
			- Regularity: Indicate if the verb is regular or irregular. Possible values include: ${Object.values(
				VerbRegularity,
			).join(', ')}.
			- Infinitive: Provide the infinitive form of the verb.

			- Voice: Specify the voice (e.g., active, passive). Possible values include: ${Object.values(
				VerbVoice,
			).join(', ')}.
			- Verb Class: Indicate the class of the verb. Possible values include: ${Object.values(
				VerbClass,
			).join(', ')}.
			- Gerund and Past Participle: Specify if the verb can be used as a gerund or past participle.
			- Reflexivity: Indicate if the verb is reflexive.
			Ensure that all possible interpretations of the verb are considered, especially in ambiguous cases.
		`,
		safetySettings: geminiSafetySettings,
	});

	try {
		const prompt = {
			contents: [
				{
					role: 'user',
					parts: [
						{
							text: `Input Verbs: ${JSON.stringify(tokens)}`,
						},
					],
				},
			],
		};

		const result = await model.generateContent(prompt);
		const response = await result.response.text();
		return JSON.parse(response);
	} catch (error) {
		console.error('❌ Error:', error);
		throw error;
	}
}
