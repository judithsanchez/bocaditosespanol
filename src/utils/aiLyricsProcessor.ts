import {GoogleGenerativeAI} from '@google/generative-ai';

const gemini = {
	apiKey: 'AIzaSyBmXIsCMkUh3-K_u1rCM5skL0-mIW6yhZY',
	model: 'gemini-pro',
};

const genAI = new GoogleGenerativeAI(gemini.apiKey);

export async function getEnglishTranslation(
	sentence: string,
	spanishWord: string,
): Promise<string> {
	try {
		const model = genAI.getGenerativeModel({model: gemini.model});

		const prompt = `Given this sentence as context "${sentence}" provide only the word in English that better translates this word in Spanish "${spanishWord}"`;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = await response.text();
		return text;
	} catch (error) {
		console.error('Error fetching translation:', error);
		return '';
	}
}

export async function getWordType(
	sentence: string,
	spanishWord: string,
): Promise<string> {
	try {
		const model = genAI.getGenerativeModel({model: gemini.model});

		const prompt = `Given this sentence as context "${sentence}" provide only the the type of word this word is "${spanishWord}" based on the following enum: export enum WordType {
      Noun = 'noun',
      Verb = 'verb',
      Conjunction = 'conjunction',
      Prepostion = 'preposition',
      Article = 'article',
    }`;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = await response.text();
		return text;
	} catch (error) {
		console.error('Error fetching word type:', error);
		return '';
	}
}
