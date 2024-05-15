import {TextProcessor} from '../TextProcessor';
import {errors} from '../../lib/constants';

describe('TextProcessor', () => {
	// describe('constructor', () => {
	// 	test('should throw an error when textData is empty', () => {
	// 		expect(() => new TextProcessor('')).toThrowError(errors.invalidData);
	// 	});
	// });

	describe('processTextData', () => {
		let textProcessor: TextProcessor;

		beforeEach(() => {
			textProcessor = new TextProcessor('This is a sample text.');
		});

		// test('should throw an error when text is empty', () => {
		// 	expect(() => textProcessor.processTextData('')).toThrowError(
		// 		errors.invalidText,
		// 	);
		// });

		// test('should return an array of sentences when text contains a single sentence', () => {
		// 	const text = 'This is a sample text.';
		// 	const result = textProcessor.processTextData(text);
		// 	expect(result).toHaveLength(1);
		// 	expect(result[0]).toEqual({
		// 		sentence: 'This is a sample text.',
		// 		tokens: ['This', 'is', 'a', 'sample', 'text', '.'],
		// 	});
		// });

		// test('should return an array of sentences when text contains multiple sentences', () => {
		// 	const text = 'This is a sample text. It has multiple sentences.';
		// 	const result = textProcessor.processTextData(text);
		// 	expect(result).toHaveLength(2);
		// 	expect(result[0]).toEqual({
		// 		sentence: 'This is a sample text.',
		// 		tokens: ['This', 'is', 'a', 'sample', 'text', '.'],
		// 	});
		// 	expect(result[1]).toEqual({
		// 		sentence: 'It has multiple sentences.',
		// 		tokens: ['It', 'has', 'multiple', 'sentences', '.'],
		// 	});
		// });

		test('should normalize and tokenize sentences correctly', () => {
			const text = 'Hello, áéíóú! Über mañana.';
			const result = textProcessor.processTextData(text);
			expect(result).toHaveLength(2);
			expect(result[0]).toEqual({
				sentence: 'hello, aeiou!',
				tokens: ['hello', ',', 'aeiou', '!'],
			});
			expect(result[1]).toEqual({
				sentence: 'uber manana.',
				tokens: ['uber', 'manana', '.'],
			});
		});

		// test('should handle emojis and punctuation correctly', () => {
		// 	const text = 'Hello 👋🏻, world! 😀 How are you?';
		// 	const result = textProcessor.processTextData(text);
		// 	expect(result).toHaveLength(2);
		// 	expect(result[0]).toEqual({
		// 		sentence: 'Hello 👋🏻, world!',
		// 		tokens: ['Hello', '👋🏻', ',', 'world', '!'],
		// 	});
		// 	expect(result[1]).toEqual({
		// 		sentence: '😀 How are you?',
		// 		tokens: ['😀', 'How', 'are', 'you', '?'],
		// 	});
		// });
	});
});
