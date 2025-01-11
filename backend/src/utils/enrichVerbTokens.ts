import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {config} from 'dotenv';
import {geminiSafetySettings} from '../lib/constants';
import {
	ConjugationPattern,
	IVerb,
	VerbAuxiliary,
	VerbClass,
	VerbMood,
	VerbRegularity,
	VerbTense,
	VerbVoice,
} from '../lib/grammaticalInfo/verbsTypes';
import {IWord} from '../lib/types';
config();

// TODO: cover with unit test
// TODO: figure out why the cognates are not being handled correctly
// TODO: make english translations also an array

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
			spanish: {type: SchemaType.STRING},
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
					conjugationPattern: {
						type: SchemaType.ARRAY,
						items: {
							type: SchemaType.STRING,
							enum: Object.values(ConjugationPattern),
						},
					},
					voice: {type: SchemaType.STRING, enum: Object.values(VerbVoice)},
					verbClass: {type: SchemaType.STRING, enum: Object.values(VerbClass)},
					gerund: {type: SchemaType.BOOLEAN},
					pastParticiple: {type: SchemaType.BOOLEAN},
					auxiliary: {
						type: SchemaType.STRING,
						enum: Object.values(VerbAuxiliary),
					},
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
					'conjugationPattern',
					'voice',
					'verbClass',
					'gerund',
					'pastParticiple',
					'auxiliary',
					'verbRegularity',
					'isReflexive',
				],
			},
		},
		required: ['tokenId', 'spanish', 'grammaticalInfo'],
	},
};
export async function enrichVerbTokens(
	tokens: Pick<IWord, 'tokenId' | 'spanish' | 'grammaticalInfo'>[],
): Promise<Pick<IWord, 'tokenId' | 'spanish' | 'grammaticalInfo'>[]> {
	console.log('� Processing verb tokens:', tokens.length);

	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash',
		generationConfig: {
			responseMimeType: 'application/json',
			responseSchema: verbTokenSchema,
		},
		systemInstruction:
			'Spanish Verb Analysis Task: analyze each of the verbs and return the enriched verb tokens array.',
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
