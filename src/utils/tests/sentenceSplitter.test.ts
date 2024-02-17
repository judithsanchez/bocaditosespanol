import {TextProcessor, Sentence} from '../sentenceSplitter';

describe('TextProcessor', () => {
	test('processes text correctly with example Spanish sentences', () => {
		// const spanishText = '¡Hola! ¿Cómo estás? Estoy bien, gracias.';
		const spanishText = '¡Hola!';

		const expectedProcessedText: Sentence[] = [
			{
				tokens: [
					{token: '¡', isPunctuationSign: true},
					{token: 'Hola', isPunctuationSign: false},
					{token: '!', isPunctuationSign: true},
				],
				sentence: '¡Hola!',
			},
			// {
			// 	tokens: [
			// 		{token: '¿', isPunctuationSign: true},
			// 		{token: 'Cómo', isPunctuationSign: false},
			// 		{token: 'estás', isPunctuationSign: false},
			// 		{token: '?', isPunctuationSign: true},
			// 	],
			// 	sentence: '¿Cómo estás?',
			// },
			// {
			// 	tokens: [
			// 		{token: 'Estoy', isPunctuationSign: false},
			// 		{token: 'bien', isPunctuationSign: false},
			// 		{token: ',', isPunctuationSign: true},
			// 		{token: 'gracias', isPunctuationSign: false},
			// 		{token: '.', isPunctuationSign: true},
			// 	],
			// 	sentence: 'Estoy bien, gracias.',
			// },
		];

		const processor = new TextProcessor(spanishText);
		console.log(processor);
		expect(processor.processedText).toEqual(expectedProcessedText);
	});
});
