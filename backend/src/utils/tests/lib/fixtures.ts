import {IWord, TokenType} from 'lib/types';

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

export const normalizeStringFixtures = {
	accentedVowels: {
		input: 'áéíóú',
		expected: 'aeiou',
	},
	spanishN: {
		input: 'mañana',
		expected: 'manana',
	},
	lowerUmlaut: {
		input: 'über',
		expected: 'uber',
	},
	upperUmlaut: {
		input: 'Über',
		expected: 'uber',
	},
	upperAccent: {
		input: 'ÉSTA',
		expected: 'esta',
	},
	noSpecialChars: {
		input: 'hello',
		expected: 'hello',
	},
	empty: {
		input: '',
		expected: '',
	},
	multipleSpecialChars: {
		input: 'áñü',
		expected: 'anu',
	},
	mixedChars: {
		input: 'áéñü',
		expected: 'aenu',
	},
	withSpaces: {
		input: '  áéñü  ',
		expected: 'aenu',
	},
	irregularWhitespace: {
		input: '  aéd   sdñá  ',
		expected: 'aed sdna',
	},
	multipleSpaces: {
		input: 'hóla    múndo',
		expected: 'hola mundo',
	},
	tabsAndNewlines: {
		input: 'hóla\t\tmúndo\n\rañó',
		expected: 'hola mundo ano',
	},
};

export const tokenizeSentencesFixtures = {
	simpleSentence: {
		input: 'Hello, world!',
		expected: [
			{
				token: {
					spanish: 'Hello',
					normalizedToken: 'hello',
					hasSpecialChar: false,
					english: '',
					wordType: '',
				},
				type: 'word' as TokenType,
			},
			{token: ',', type: 'punctuationSign' as TokenType},
			{
				token: {
					spanish: 'world',
					normalizedToken: 'world',
					hasSpecialChar: false,
					english: '',
					wordType: '',
				},
				type: 'word' as TokenType,
			},
			{token: '!', type: 'punctuationSign' as TokenType},
		],
	},
	multiplePunctuation: {
		input: 'Hello, world! How are you?',
		expected: [
			{
				token: {
					spanish: 'Hello',
					normalizedToken: 'hello',
					hasSpecialChar: false,
					english: '',
					wordType: '',
				},
				type: 'word' as TokenType,
			},
			{token: ',', type: 'punctuationSign' as TokenType},
			{
				token: {
					spanish: 'world',
					normalizedToken: 'world',
					hasSpecialChar: false,
					english: '',
					wordType: '',
				},
				type: 'word' as TokenType,
			},
			{token: '!', type: 'punctuationSign' as TokenType},
			{
				token: {
					spanish: 'How',
					normalizedToken: 'how',
					hasSpecialChar: false,
					english: '',
					wordType: '',
				},
				type: 'word' as TokenType,
			},
			{
				token: {
					spanish: 'are',
					normalizedToken: 'are',
					hasSpecialChar: false,
					english: '',
					wordType: '',
				},
				type: 'word' as TokenType,
			},
			{
				token: {
					spanish: 'you',
					normalizedToken: 'you',
					hasSpecialChar: false,
					english: '',
					wordType: '',
				},
				type: 'word' as TokenType,
			},
			{token: '?', type: 'punctuationSign' as TokenType},
		],
	},
	withEmojis: {
		input: 'Hello 👋🏻, world! 😀',
		expected: [
			{
				token: {
					spanish: 'Hello',
					normalizedToken: 'hello',
					hasSpecialChar: false,
					english: '',
					wordType: '',
				},
				type: 'word' as TokenType,
			},
			{token: '👋🏻', type: 'emoji' as TokenType},
			{token: ',', type: 'punctuationSign' as TokenType},
			{
				token: {
					spanish: 'world',
					normalizedToken: 'world',
					hasSpecialChar: false,
					english: '',
					wordType: '',
				},
				type: 'word' as TokenType,
			},
			{token: '!', type: 'punctuationSign' as TokenType},
			{token: '😀', type: 'emoji' as TokenType},
		],
	},
	emojiSkinTones: {
		input: '👋🏻 👋🏼 👋🏽 👋🏾 👋🏿',
		expected: [
			{token: '👋🏻', type: 'emoji' as TokenType},
			{token: '👋🏼', type: 'emoji' as TokenType},
			{token: '👋🏽', type: 'emoji' as TokenType},
			{token: '👋🏾', type: 'emoji' as TokenType},
			{token: '👋🏿', type: 'emoji' as TokenType},
		],
	},
};

export const batchProcessorFixtures = {
	simpleItems: {
		input: ['item1', 'item2', 'item3', 'item4', 'item5'],
		expected: [
			'processed1',
			'processed2',
			'processed3',
			'processed4',
			'processed5',
		],
	},
	emptyItems: {
		input: [],
		expected: [],
	},
	defaultConfig: {
		batchSize: 2,
		options: {
			retryAttempts: 3,
			delayBetweenBatches: 100,
			maxRequestsPerMinute: 30,
		},
	},
};
