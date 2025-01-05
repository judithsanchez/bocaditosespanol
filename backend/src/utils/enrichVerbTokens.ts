import {GoogleGenerativeAI} from '@google/generative-ai';
import {config} from 'dotenv';
import {IToken} from '../../../lib/types';
import {geminiSafetySettings, geminiVerbTokenSchema} from 'lib/constants';
import {
	ConjugationPattern,
	VerbClass,
	VerbMood,
	VerbTense,
	VerbVoice,
} from 'lib/grammaticalInfo/verbsTypes';
config();

// TODO: cover with unit test
// TODO: figure out why the cognates are not being handled correctly

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

console.log('🚀 Initializing AI Text Processor');

const genAI = new GoogleGenerativeAI(
	process.env.GOOGLE_GENERATIVE_AI_KEY ?? '',
);

const model = genAI.getGenerativeModel({
	model: 'gemini-1.5-flash',
	generationConfig: {
		responseMimeType: 'application/json',
		responseSchema: geminiVerbTokenSchema,
	},
	safetySettings: geminiSafetySettings,
});

export async function enrichVerbTokens(tokens: IToken[]): Promise<IToken[]> {
	console.log('� Processing verb tokens:', tokens.length);

	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash',
		generationConfig: {
			responseMimeType: 'application/json',
			responseSchema: geminiVerbTokenSchema,
		},
		safetySettings: geminiSafetySettings,
	});

	try {
		const prompt = {
			contents: [
				{
					role: 'user',
					parts: [
						{
							text: `Spanish Verb Analysis Task:

Input Verbs: ${JSON.stringify(tokens)}

Requirements:
1. Analyze ONLY verb tokens
2. For each verb determine:
	 - Tense (${Object.values(VerbTense).join(', ')})
	 - Mood (${Object.values(VerbMood).join(', ')})
	 - Person and Number
	 - Regular/Irregular status
	 - Infinitive form
	 - Conjugation pattern (${Object.values(ConjugationPattern).join(', ')})
	 - Voice (${Object.values(VerbVoice).join(', ')})
	 - Verb class (${Object.values(VerbClass).join(', ')})
	 - Additional properties (gerund, participle, auxiliary verb)

Return the enriched verb tokens array.`,
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
