export const paragraphSplitterFixtures = {
	basicSentences: {
		input: 'This is a sentence. And this is another one.',
		expected: ['This is a sentence.', 'And this is another one.'],
	},
	multiplePunctuation: {
		input: `Hello, world! How are you? I'm doing well.`,
		expected: ['Hello, world!', 'How are you?', "I'm doing well."],
	},
	withEmojis: {
		input: 'Hello 👋🏻, world! 😀 How are you?',
		expected: ['Hello 👋🏻, world!', '😀 How are you?'],
	},
	withEllipsis: {
		input: 'Hello... world!',
		expected: ['Hello...', 'world!'],
	},
	empty: {
		input: '',
		expected: [] as string[],
	},
	singleSentence: {
		input: 'This is a sentence.',
		expected: ['This is a sentence.'],
	},
	multipleSentences: {
		input: 'This is a sentence. And this is another one. And one more.',
		expected: [
			'This is a sentence.',
			'And this is another one.',
			'And one more.',
		],
	},
	spanishSentences: {
		input: '¡Hola mundo! ¿Cómo estás? Estoy bien.',
		expected: ['¡Hola mundo!', '¿Cómo estás?', 'Estoy bien.'],
	},
	specialCharacters: {
		input: 'El niño está jugando. La niña cumplió años. El pingüino nada.',
		expected: [
			'El niño está jugando.',
			'La niña cumplió años.',
			'El pingüino nada.',
		],
	},
	lineBreaks: {
		input: 'Primera línea.\nSegunda línea.\r\nTercera línea.',
		expected: ['Primera línea.', 'Segunda línea.', 'Tercera línea.'],
	},
	mixedPunctuation: {
		input: '¡Qué sorpresa! ¿Sabes qué...? ¡No me lo esperaba!',
		expected: ['¡Qué sorpresa!', '¿Sabes qué...?', '¡No me lo esperaba!'],
	},
	accentsAndDiacritics: {
		input: 'Él está en París. María habló francés. La señora cantó.',
		expected: ['Él está en París.', 'María habló francés.', 'La señora cantó.'],
	},
	multipleSpaces: {
		input: 'Una    frase.    Otra     frase.   Última.',
		expected: ['Una frase.', 'Otra frase.', 'Última.'],
	},
};
