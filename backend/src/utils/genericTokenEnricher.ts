import {GoogleGenerativeAI} from '@google/generative-ai';
import {geminiSafetySettings} from '../lib/constants';
import {IWord} from '@bocaditosespanol/shared';
import {Logger} from './Logger';

interface EnricherConfig {
	tokens: Pick<IWord, 'tokenId' | 'content' | 'grammaticalInfo'>[];
	schema: any;
	partOfSpeech: string;
	systemInstruction: string;
}

export async function enrichTokens({
	tokens,
	schema,
	partOfSpeech,
	systemInstruction,
}: EnricherConfig) {
	const logger = new Logger(`${partOfSpeech}Enricher`);
	const genAI = new GoogleGenerativeAI(
		process.env.GOOGLE_GENERATIVE_AI_KEY || '',
	);

	logger.start(`enrich${partOfSpeech}Tokens`);
	logger.info(`Processing ${partOfSpeech.toLowerCase()} tokens`, {
		count: tokens.length,
	});

	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash-8b',
		generationConfig: {
			responseMimeType: 'application/json',
			responseSchema: schema,
		},
		systemInstruction,
		safetySettings: geminiSafetySettings,
	});

	try {
		const prompt = {
			contents: [
				{
					role: 'user',
					parts: [{text: `Input ${partOfSpeech}: ${JSON.stringify(tokens)}`}],
				},
			],
		};

		logger.info('Sending request to AI model');
		const result = await model.generateContent(prompt);
		const response = await result.response.text();

		const enrichedTokens = JSON.parse(response);
		logger.info(`${partOfSpeech} enriched successfully`, {
			inputCount: tokens.length,
			outputCount: enrichedTokens.length,
		});

		logger.end(`enrich${partOfSpeech}Tokens`);
		return enrichedTokens;
	} catch (error) {
		logger.error(`${partOfSpeech} enrichment failed`, error);
		throw error;
	}
}

// import {PartOfSpeechSchemaFactory} from './partOfSpeechSchemaFactory';
// import {SystemInstructionFactory} from './systemInstructionFactory';
// import {enrichTokens} from './genericTokenEnricher';
// import type {IWord} from '../lib/types';

// export async function enrichAdjectiveTokens(
// 	tokens: Pick<IWord, 'tokenId' | 'content' | 'grammaticalInfo'>[],
// ) {
// 	return enrichTokens({
// 		tokens,
// 		schema: PartOfSpeechSchemaFactory.createAdjectiveSchema(),
// 		partOfSpeech: 'Adjective',
// 		systemInstruction: SystemInstructionFactory.createAdjectiveInstruction(),
// 	});
// }

// export async function enrichNounTokens(
// 	tokens: Pick<IWord, 'tokenId' | 'content' | 'grammaticalInfo'>[],
// ) {
// 	return enrichTokens({
// 		tokens,
// 		schema: PartOfSpeechSchemaFactory.createNounSchema(),
// 		partOfSpeech: 'Noun',
// 		systemInstruction: SystemInstructionFactory.createNounInstruction(),
// 	});
// }
