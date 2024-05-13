import {paragraphSplitter} from '@utils/paragraphSplitter';

describe('paragraphSplitter', () => {
	test('splits a string into an array of sentences', () => {
		const input = 'This is a sentence. And this is another one.';
		const expected = ['This is a sentence.', 'And this is another one.'];
		expect(paragraphSplitter(input)).toEqual(expected);
	});

	test('handles strings with multiple punctuation marks', () => {
		const input = `Hello, world! How are you? I'm doing well.`;
		const expected = ['Hello,', 'world!', 'How are you?', "I'm doing well."];
		expect(paragraphSplitter(input)).toEqual(expected);
	});

	test('handles strings with emojis', () => {
		const input = 'Hello 👋🏻, world! 😀 How are you?';
		const expected = ['Hello 👋🏻,', 'world!', '😀 How are you?'];
		expect(paragraphSplitter(input)).toEqual(expected);
	});

	test('handles strings with ellipsis', () => {
		const input = 'Hello... world!';
		const expected = ['Hello...', 'world!'];
		expect(paragraphSplitter(input)).toEqual(expected);
	});

	test('handles empty strings', () => {
		const input = '';
		const expected: string[] = [];
		expect(paragraphSplitter(input)).toEqual(expected);
	});

	test('handles strings with trailing punctuation', () => {
		const input = 'This is a sentence.';
		const expected = ['This is a sentence.'];
		expect(paragraphSplitter(input)).toEqual(expected);
	});

	// test('handles strings with leading punctuation', () => {
	// 	const input = '!This is a sentence.';
	// 	const expected = ['!This is a sentence.'];
	// 	expect(paragraphSplitter(input)).toEqual(expected);
	// });

	test('handles strings with multiple sentences and trailing punctuation', () => {
		const input = 'This is a sentence. And this is another one. And one more.';
		const expected = [
			'This is a sentence.',
			'And this is another one.',
			'And one more.',
		];
		expect(paragraphSplitter(input)).toEqual(expected);
	});
});
