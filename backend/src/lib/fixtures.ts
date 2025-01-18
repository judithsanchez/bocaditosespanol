import {IWord, PartOfSpeech, TokenType} from 'lib/types';

export const splitParagraphFixtures = {
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

export const inputValidatorFixtures = {
	validSongInput: {
		interpreter: 'Test Artist',
		title: 'Test Song',
		youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
		genre: ['pop'],
		language: 'es',
		releaseDate: '2023-01-01',
		lyrics: 'Test lyrics',
	},
	validyoutubeUrls: [
		'https://youtube.com/watch?v=dQw4w9WgXcQ',
		'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
	],
	invalidInputs: {
		emptyInterpreter: {
			interpreter: '',
			title: 'Test Song',
			youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
			genre: ['pop'],
			language: 'es',
			releaseDate: '2023-01-01',
			lyrics: 'Test lyrics',
		},
		invalidyoutubeUrl: {
			interpreter: 'Test Artist',
			title: 'Test Song',
			youtube: 'invalid-url',
			genre: ['pop'],
			language: 'es',
			releaseDate: '2023-01-01',
			lyrics: 'Test lyrics',
		},
		invalidGenreFormat: {
			interpreter: 'Test Artist',
			title: 'Test Song',
			youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
			genre: 'pop' as any,
			language: 'es',
			releaseDate: '2023-01-01',
			lyrics: 'Test lyrics',
		},
		emptyLyrics: {
			interpreter: 'Test Artist',
			title: 'Test Song',
			youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
			genre: ['pop'],
			language: 'es',
			releaseDate: '2023-01-01',
			lyrics: '',
		},
	},
};

export const tokenProcessorFixtures = {
	basicContext: {
		sentences: {
			formatted: [
				{
					sentenceId: 'test-1',
					content: 'Hello world!',
					translations: {
						english: {
							literal: '',
							contextual: '',
						},
					},
					tokenIds: [],
				},
			],
			deduplicated: [
				{
					sentenceId: 'test-1',
					content: 'Hello world!',
					translations: {
						english: {
							literal: '',
							contextual: '',
						},
					},
					tokenIds: [],
				},
			],
		},
	},
	tokenizationCases: {
		simple: {
			input: 'Hello world!',
			expected: [
				{
					tokenId: 'token-hello',
					content: 'Hello',
					normalizedToken: 'hello',
					tokenType: TokenType.Word,
					translations: {english: []},
					hasSpecialChar: false,
					partOfSpeech: '',
					isSlang: false,
					isCognate: false,
					isFalseCognate: false,
				},
				{
					tokenId: 'token-world',
					content: 'world',
					normalizedToken: 'world',
					tokenType: TokenType.Word,
					translations: {english: []},
					hasSpecialChar: false,
					partOfSpeech: '',
					isSlang: false,
					isCognate: false,
					isFalseCognate: false,
				},
				{
					tokenId: 'token-!',
					content: '!',
					tokenType: TokenType.PunctuationSign,
				},
			],
		},
		withEmojis: {
			input: 'Hello 👋 world! 😀',
			expected: [
				{
					tokenId: 'token-hello',
					content: 'Hello',
					normalizedToken: 'hello',
					tokenType: TokenType.Word,
					translations: {english: []},
					hasSpecialChar: false,
					partOfSpeech: '',
					isSlang: false,
					isCognate: false,
					isFalseCognate: false,
				},
				{
					tokenId: 'token-👋',
					content: '👋',
					tokenType: TokenType.Emoji,
				},
				{
					tokenId: 'token-world',
					content: 'world',
					normalizedToken: 'world',
					tokenType: TokenType.Word,
					translations: {english: []},
					hasSpecialChar: false,
					partOfSpeech: '',
					isSlang: false,
					isCognate: false,
					isFalseCognate: false,
				},
				{
					tokenId: 'token-!',
					content: '!',
					tokenType: TokenType.PunctuationSign,
				},
				{
					tokenId: 'token-😀',
					content: '😀',
					tokenType: TokenType.Emoji,
				},
			],
		},
		withSpecialChars: {
			input: '¡Hola señor!',
			expected: [
				{
					tokenId: 'token-¡',
					content: '¡',
					tokenType: TokenType.PunctuationSign,
				},
				{
					tokenId: 'token-hola',
					content: 'Hola',
					normalizedToken: 'hola',
					tokenType: TokenType.Word,
					translations: {english: []},
					hasSpecialChar: false,
					partOfSpeech: '',
					isSlang: false,
					isCognate: false,
					isFalseCognate: false,
				},
				{
					tokenId: 'token-señor',
					content: 'señor',
					normalizedToken: 'señor',
					tokenType: TokenType.Word,
					translations: {english: []},
					hasSpecialChar: true,
					partOfSpeech: '',
					isSlang: false,
					isCognate: false,
					isFalseCognate: false,
				},
				{
					tokenId: 'token-!',
					content: '!',
					tokenType: TokenType.PunctuationSign,
				},
			],
		},
	},
};

export const basicEnricherFixtures = {
	// Input context fixtures
	inputContext: {
		tokens: {
			all: [
				{
					tokenId: 'token-1',
					content: 'canta',
					normalizedToken: 'canta',
					tokenType: TokenType.Word,
					translations: {english: ['sings']},
					hasSpecialChar: false,
					partOfSpeech: PartOfSpeech.Verb,
					isSlang: false,
					isCognate: false,
					isFalseCognate: false,
				},
				{
					tokenId: 'token-2',
					content: 'gato',
					normalizedToken: 'gato',
					tokenType: TokenType.Word,
					translations: {english: ['cat']},
					hasSpecialChar: false,
					partOfSpeech: PartOfSpeech.Noun,
					isSlang: false,
					isCognate: false,
					isFalseCognate: false,
				},
				{
					tokenId: 'token-3',
					content: '.',
					tokenType: TokenType.PunctuationSign,
				},
			],
			words: [], // Add empty arrays for completeness
			deduplicated: [],
			enriched: [],
		},
	},

	// Mock responses for different scenarios
	mockResponses: {
		enrichedWords: [
			{
				tokenId: 'token-1',
				content: 'canta',
				normalizedToken: 'canta',
				tokenType: TokenType.Word,
				translations: {english: ['sings']},
				hasSpecialChar: false,
				partOfSpeech: PartOfSpeech.Verb,
				isSlang: false,
				isCognate: false,
				isFalseCognate: false,
				grammaticalInfo: {
					tense: [],
					mood: '',
					person: [],
					number: '',
					isRegular: false,
					infinitive: '',
					voice: '',
					verbClass: '',
					gerund: false,
					pastParticiple: false,
					verbRegularity: '',
					isReflexive: false,
				},
			},
			{
				tokenId: 'token-2',
				content: 'gato',
				normalizedToken: 'gato',
				tokenType: TokenType.Word,
				translations: {english: ['cat']},
				hasSpecialChar: false,
				partOfSpeech: PartOfSpeech.Noun,
				isSlang: false,
				isCognate: false,
				isFalseCognate: false,
				grammaticalInfo: {
					gender: '',
					number: '',
					isProperNoun: false,
					diminutive: false,
				},
			},
		],
		emptyResponse: [],
		errorResponse: new Error('Batch processing failed'),
	},

	// Expected enriched output
	expectedEnrichedOutput: {
		tokens: {
			all: [
				{
					tokenId: 'token-1',
					content: 'canta',
					normalizedToken: 'canta',
					tokenType: TokenType.Word,
					translations: {english: ['sings']},
					hasSpecialChar: false,
					partOfSpeech: PartOfSpeech.Verb,
					isSlang: false,
					isCognate: false,
					isFalseCognate: false,
					grammaticalInfo: {
						tense: [],
						mood: '',
						person: [],
						number: '',
						isRegular: false,
						infinitive: '',
						voice: '',
						verbClass: '',
						gerund: false,
						pastParticiple: false,
						verbRegularity: '',
						isReflexive: false,
					},
				},
				{
					tokenId: 'token-2',
					content: 'gato',
					normalizedToken: 'gato',
					tokenType: TokenType.Word,
					translations: {english: ['cat']},
					hasSpecialChar: false,
					partOfSpeech: PartOfSpeech.Noun,
					isSlang: false,
					isCognate: false,
					isFalseCognate: false,
					grammaticalInfo: {
						gender: '',
						number: '',
						isProperNoun: false,
						diminutive: false,
					},
				},
				{
					tokenId: 'token-3',
					content: '.',
					tokenType: TokenType.PunctuationSign,
				},
			],
			enriched: [
				{
					tokenId: 'token-1',
					content: 'canta',
					normalizedToken: 'canta',
					tokenType: TokenType.Word,
					translations: {english: ['sings']},
					hasSpecialChar: false,
					partOfSpeech: PartOfSpeech.Verb,
					isSlang: false,
					isCognate: false,
					isFalseCognate: false,
					grammaticalInfo: {
						tense: [],
						mood: '',
						person: [],
						number: '',
						isRegular: false,
						infinitive: '',
						voice: '',
						verbClass: '',
						gerund: false,
						pastParticiple: false,
						verbRegularity: '',
						isReflexive: false,
					},
				},
				{
					tokenId: 'token-2',
					content: 'gato',
					normalizedToken: 'gato',
					tokenType: TokenType.Word,
					translations: {english: ['cat']},
					hasSpecialChar: false,
					partOfSpeech: PartOfSpeech.Noun,
					isSlang: false,
					isCognate: false,
					isFalseCognate: false,
					grammaticalInfo: {
						gender: '',
						number: '',
						isProperNoun: false,
						diminutive: false,
					},
				},
				{
					tokenId: 'token-3',
					content: '.',
					tokenType: TokenType.PunctuationSign,
				},
			],
		},
	},

	// Part of speech statistics test cases
	posStats: {
		input: [
			{
				tokenId: 'token-1',
				content: 'canta',
				normalizedToken: 'canta',
				tokenType: TokenType.Word,
				partOfSpeech: PartOfSpeech.Verb,
			} as IWord,
			{
				tokenId: 'token-2',
				content: 'gato',
				normalizedToken: 'gato',
				tokenType: TokenType.Word,
				partOfSpeech: PartOfSpeech.Noun,
			} as IWord,
			{
				tokenId: 'token-3',
				content: 'rápido',
				normalizedToken: 'rapido',
				tokenType: TokenType.Word,
				partOfSpeech: PartOfSpeech.Adjective,
			} as IWord,
			{
				tokenId: 'token-4',
				content: 'gato',
				normalizedToken: 'gato',
				tokenType: TokenType.Word,
				partOfSpeech: PartOfSpeech.Noun,
			} as IWord,
		],
		expected: {
			[PartOfSpeech.Verb]: 1,
			[PartOfSpeech.Noun]: 2,
			[PartOfSpeech.Adjective]: 1,
		},
	},

	// Rate limits testing
	rateLimits: {
		BATCH_SIZE: 10,
		RETRY_ATTEMPTS: 3,
		DELAY_BETWEEN_BATCHES: 6000,
		REQUESTS_PER_MINUTE: 1,
	},

	// Edge cases
	edgeCases: {
		emptyContext: {
			tokens: {
				all: [],
			},
		},
		unknownPartOfSpeech: {
			tokenId: 'token-unknown',
			content: 'test',
			normalizedToken: 'test',
			tokenType: TokenType.Word,
			partOfSpeech: 'unknown',
			expectedGrammaticalInfo: {},
		},
		missingPartOfSpeech: {
			tokenId: 'token-missing',
			content: 'test',
			normalizedToken: 'test',
			tokenType: TokenType.Word,
			partOfSpeech: undefined,
		},
	},
};

export const sentenceEnricherFixtures = {
	inputContext: {
		sentences: {
			deduplicated: [
				{
					sentenceId: 'test-1',
					content: 'Hola mundo.',
					translations: {
						english: {
							literal: '',
							contextual: '',
						},
					},
					tokenIds: ['token-1', 'token-2'],
				},
				{
					sentenceId: 'test-2',
					content: '¿Cómo estás?',
					translations: {
						english: {
							literal: '',
							contextual: '',
						},
					},
					tokenIds: ['token-3', 'token-4'],
				},
			],
		},
	},

	mockResponses: {
		enrichedSentences: [
			{
				sentenceId: 'test-1',
				content: 'Hola mundo.',
				translations: {
					english: {
						literal: 'Hello world.',
						contextual: 'Hello world.',
					},
				},
				tokenIds: ['token-1', 'token-2'],
			},
			{
				sentenceId: 'test-2',
				content: '¿Cómo estás?',
				translations: {
					english: {
						literal: 'How are you?',
						contextual: 'How are you?',
					},
				},
				tokenIds: ['token-3', 'token-4'],
			},
		],
	},
};
