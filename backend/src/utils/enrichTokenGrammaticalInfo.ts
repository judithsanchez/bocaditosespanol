// import {
// 	GoogleGenerativeAI,
// 	HarmBlockThreshold,
// 	HarmCategory,
// 	SchemaType,
// } from '@google/generative-ai';
// import {ISentence} from '../../../lib/types';
// import {config} from 'dotenv';
// import {IWord} from 'lib/types';
// config();

// // TODO: cover with unit test

// const genAI = new GoogleGenerativeAI(
// 	process.env.GOOGLE_GENERATIVE_AI_KEY ?? '',
// );

// const sentenceSchema = {
// 	type: SchemaType.OBJECT,
// 	properties: {
// 		sentenceId: {type: SchemaType.STRING},
// 		sentence: {type: SchemaType.STRING},
// 		tokens: {
// 			type: SchemaType.ARRAY,
// 			items: {
// 				type: SchemaType.OBJECT,
// 				properties: {
// 					token: {
// 						type: SchemaType.OBJECT,
// 						properties: {
// 							spanish: {type: SchemaType.STRING},
// 							normalizedToken: {type: SchemaType.STRING},
// 							english: {type: SchemaType.STRING},
// 							hasSpecialChar: {type: SchemaType.BOOLEAN},
// 							partOfSpeech: {type: SchemaType.STRING},
// 							isSlang: {type: SchemaType.BOOLEAN},
// 							isCognate: {type: SchemaType.BOOLEAN},
// 							isFalseCognate: {type: SchemaType.BOOLEAN},
// 						},
// 						required: ['spanish', 'normalizedToken', 'hasSpecialChar'],
// 					},
// 					type: {
// 						type: SchemaType.STRING,
// 						enum: ['word'],
// 					},
// 				},
// 				required: ['token', 'type'],
// 			},
// 		},
// 	},
// 	required: ['sentenceId', 'sentence', 'translation', 'tokens'],
// };

// const model = genAI.getGenerativeModel({
// 	model: 'gemini-1.5-flash',
// 	generationConfig: {
// 		responseMimeType: 'application/json',
// 		responseSchema: sentenceSchema,
// 	},
// 	safetySettings: [
// 		{
// 			category: HarmCategory.HARM_CATEGORY_HARASSMENT,
// 			threshold: HarmBlockThreshold.BLOCK_NONE,
// 		},
// 		{
// 			category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
// 			threshold: HarmBlockThreshold.BLOCK_NONE,
// 		},
// 		{
// 			category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
// 			threshold: HarmBlockThreshold.BLOCK_NONE,
// 		},
// 		{
// 			category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
// 			threshold: HarmBlockThreshold.BLOCK_NONE,
// 		},
// 	],
// });
// export async function enrichTokenGrammaticalInfo(
// 	sentences: ISentence[],
// ): Promise<ISentence[]> {
// 	console.log('\n🎯 Starting token grammatical info enrichment');
// 	console.log(`Processing batch of ${sentences.length} sentences`);

// 	try {
// 		const prompt = {
// 			contents: [
// 				{
// 					role: 'user',
// 					parts: [
// 						{
// 							text: `Linguistic Analysis Task for Spanish-English Learning:

// Input Array: ${JSON.stringify(sentences)}

// OBJECTIVE:
// Analyze each word token in the Spanish sentence and enrich it with linguistic metadata while preserving the exact sentence structure.

// REQUIRED ANALYSIS FOR EACH WORD TOKEN:
// 1. SLANG DETECTION (isSlang)
// 	 - Mark true if the word is:
// 		 * Informal/colloquial Spanish
// 		 * Regional expressions
// 		 * Youth language
// 		 * Street vocabulary
// 	 - Mark false if the word is standard Spanish

// 2. COGNATE DETECTION (isCognate)
// 	 - Mark true if the word:
// 		 * Shares similar spelling with English
// 		 * Has similar meaning in English
// 		 * Examples: "doctor/doctor", "familia/family"
// 	 - Mark false for non-cognates

// 3. FALSE COGNATE DETECTION (isFalseCognate)
// 	 - Mark true if the word:
// 		 * Looks similar to an English word
// 		 * Has a different meaning than the similar English word
// 		 * Examples:
// 			 - "embarazada" (pregnant) ≠ "embarrassed"
// 			 - "actual" (current) ≠ "actual"
// 			 - "carpeta" (folder) ≠ "carpet"
// 	 - Mark false if not a false cognate

// STRICT PROCESSING RULES:
// - Only modify tokens where type="word"
// - Preserve all existing token properties
// - Maintain original sentence structure
// - Keep punctuation and non-word tokens unchanged
// - Return the complete sentence object with enriched word tokens

// RESPONSE FORMAT:
// Must match the input structure with added isSlang, isCognate, and isFalseCognate properties for word tokens only.`,
// 						},
// 					],
// 				},
// 			],
// 		};

// 		const result = await model.generateContent(prompt);
// 		const response = await result.response.text();
// 		const enrichedBatch = JSON.parse(response);

// 		const processedSentences = sentences.map(
// 			(originalSentence, sentenceIndex) => {
// 				console.log('Enriched batch:', enrichedBatch);
// 				console.log('Current sentence tokens:', originalSentence.tokens);

// 				const enrichedTokens = originalSentence.tokens.map(token => {
// 					if (token.type !== 'word') return token;

// 					const currentBatchData = enrichedBatch[sentenceIndex];
// 					console.log('Current batch data:', currentBatchData);

// 					const enrichedInfo = currentBatchData?.tokens?.find(
// 						(t: any) => t.token.spanish === (token.token as IWord).spanish,
// 					);

// 					return {
// 						...token,
// 						token: {
// 							...(token.token as IWord),
// 							isSlang: enrichedInfo?.token?.isSlang || false,
// 							isCognate: enrichedInfo?.token?.isCognate || false,
// 						},
// 					};
// 				});

// 				return {
// 					...originalSentence,
// 					tokens: enrichedTokens,
// 				};
// 			},
// 		);

// 		console.log('✅ Token grammatical info enrichment completed\n');
// 		return processedSentences;
// 	} catch (error) {
// 		console.error('❌ Error during token enrichment:', error);
// 		throw new Error(`Error enriching tokens: ${error}`);
// 	}
// }
