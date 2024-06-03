import {
	GoogleGenerativeAI,
	HarmBlockThreshold,
	HarmCategory,
} from '@google/generative-ai';

const gemini = {
	apiKey: 'AIzaSyBmXIsCMkUh3-K_u1rCM5skL0-mIW6yhZY',
	model: 'gemini-1.5-flash',
};

const genAI = new GoogleGenerativeAI(gemini.apiKey);

export async function getEnglishTranslation(
	sentence: string,
	spanishWord: string,
): Promise<string> {
	try {
		const model = genAI.getGenerativeModel({
			model: gemini.model,
			safetySettings: [
				{
					category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
					threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
				},
				// {
				// 	category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
				// 	threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
				// },
				{
					category: HarmCategory.HARM_CATEGORY_HARASSMENT,
					threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
				},
				// {
				// 	category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
				// 	threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
				// },
				// {
				// 	category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
				// 	threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
				// },
			],
		});

		const prompt = `Given this sentence as context "${sentence}" provide only the word in English that better translates this word in Spanish "${spanishWord}". Give me only the translated word in english as a string`;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = await response.text();
		return text.replace(/\s/g, '');
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

		const prompt = `As a response ONLY give me a single word with the parts of speech of ${spanishWord}. Make sure to select the part of speech from the following list:  
	
		Word types: noun, verb, conjunction, preposition, article, adjective, adverbs, interjection, preposition, pronoun, interrogative pronoun, determiner, particle, punctuation.

		If the part of speech is not in the list of Word Types return unkown.

	Here you have for context the sentence that it belongs to "${sentence}"`;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = await response.text();
		return text.replace(/\s/g, '');
	} catch (error) {
		console.error('Error fetching word type:', error);
		return '';
	}
}
