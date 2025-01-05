import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {config} from 'dotenv';
import {ISentence} from '../../../lib/types';
import {errors, geminiSafetySettings} from '../lib/constants';
config();

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
			content: {type: SchemaType.STRING},
			translation: {type: SchemaType.STRING},
			literalTranslation: {type: SchemaType.STRING},
			tokenIds: {type: SchemaType.ARRAY, items: {type: SchemaType.STRING}},
		},
		required: [
			'sentenceId',
			'content',
			'translation',
			'literalTranslation',
			'tokenIds',
		],
	},
};
const model = genAI.getGenerativeModel({
	model: 'gemini-1.5-flash',
	generationConfig: {
		responseMimeType: 'application/json',
		responseSchema: sentenceSchema,
	},
	safetySettings: geminiSafetySettings,
});

export async function enrichSentencesWithAI(
	sentences: ISentence[],
): Promise<ISentence[]> {
	console.log('\n🎯 AI Enrichment Pipeline Started');
	console.log('📊 Input Statistics:', {
		sentenceCount: sentences.length,
		firstSentence: sentences[0]?.content || 'No sentences provided',
	});

	try {
		console.log('🔧 Configuring AI Request');
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
2. For EACH sentence in the array:
	  - ADD complete English translation
	  - ADD literal word-for-word translation that maintains Spanish grammar structure but still makes sense on the context
			Example: "Yo tengo hambre" → "I have hunger"
			Example: "Me gusta bailar" → "To me pleases to dance"
	  - KEEP all other existing properties untocuhed

3. Response Format:
	  - Must be an array matching input length
	  - Must follow exact schema structure
	  - Must preserve sentence order

Generate response as an array of fully processed sentences.`,
						},
					],
				},
			],
		};
		console.log('📤 Sending Request to Gemini');
		const result = await model.generateContent(prompt);

		console.log('📥 Received Raw Response');
		const response = await result.response.text();
		console.log('🔍 Raw Response Length:', response.length);

		if (!response) {
			throw new Error(errors.aiProcessing.emptyResponse);
		}

		try {
			console.log('🔄 Parsing JSON Response');
			const enrichedSentences = JSON.parse(response);
			console.log('✨ Enriched Data Structure:', {
				type: Array.isArray(enrichedSentences)
					? 'array'
					: typeof enrichedSentences,
				length: Array.isArray(enrichedSentences) ? enrichedSentences.length : 1,
			});

			if (
				!Array.isArray(enrichedSentences) &&
				typeof enrichedSentences !== 'object'
			) {
				throw new Error(errors.aiProcessing.invalidResponse);
			}

			// Schema validation check
			if (!enrichedSentences[0]?.sentenceId || !enrichedSentences[0]?.content) {
				throw new Error(errors.aiProcessing.schemaValidation);
			}

			const finalResponse = Array.isArray(enrichedSentences)
				? enrichedSentences
				: [enrichedSentences];

			console.log('🎉 Processing Summary:', {
				inputCount: sentences.length,
				outputCount: finalResponse.length,
				samplesProcessed: finalResponse.map(s => ({
					id: s.sentenceId,
					hasTranslation: !!s.translation,
					hasLiteralTranslation: !!s.literalTranslation,
				})),
			});

			return finalResponse;
		} catch (parseError) {
			throw new Error(`${errors.aiProcessing.parsingError} `);
		}
	} catch (error) {
		console.error('💥 AI Processing Error:');
		throw new Error(`${errors.aiProcessing.requestFailed}`);
	}
}
