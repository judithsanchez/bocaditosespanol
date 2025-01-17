"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sentenceEnricherFixtures = exports.basicEnricherFixtures = exports.tokenProcessorFixtures = exports.inputValidatorFixtures = exports.batchProcessorFixtures = exports.tokenizeSentencesFixtures = exports.normalizeStringFixtures = exports.splitParagraphFixtures = void 0;
const types_1 = require("lib/types");
exports.splitParagraphFixtures = {
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
        expected: [],
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
exports.normalizeStringFixtures = {
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
exports.tokenizeSentencesFixtures = {
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
                type: 'word',
            },
            { token: ',', type: 'punctuationSign' },
            {
                token: {
                    spanish: 'world',
                    normalizedToken: 'world',
                    hasSpecialChar: false,
                    english: '',
                    wordType: '',
                },
                type: 'word',
            },
            { token: '!', type: 'punctuationSign' },
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
                type: 'word',
            },
            { token: ',', type: 'punctuationSign' },
            {
                token: {
                    spanish: 'world',
                    normalizedToken: 'world',
                    hasSpecialChar: false,
                    english: '',
                    wordType: '',
                },
                type: 'word',
            },
            { token: '!', type: 'punctuationSign' },
            {
                token: {
                    spanish: 'How',
                    normalizedToken: 'how',
                    hasSpecialChar: false,
                    english: '',
                    wordType: '',
                },
                type: 'word',
            },
            {
                token: {
                    spanish: 'are',
                    normalizedToken: 'are',
                    hasSpecialChar: false,
                    english: '',
                    wordType: '',
                },
                type: 'word',
            },
            {
                token: {
                    spanish: 'you',
                    normalizedToken: 'you',
                    hasSpecialChar: false,
                    english: '',
                    wordType: '',
                },
                type: 'word',
            },
            { token: '?', type: 'punctuationSign' },
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
                type: 'word',
            },
            { token: '👋🏻', type: 'emoji' },
            { token: ',', type: 'punctuationSign' },
            {
                token: {
                    spanish: 'world',
                    normalizedToken: 'world',
                    hasSpecialChar: false,
                    english: '',
                    wordType: '',
                },
                type: 'word',
            },
            { token: '!', type: 'punctuationSign' },
            { token: '😀', type: 'emoji' },
        ],
    },
    emojiSkinTones: {
        input: '👋🏻 👋🏼 👋🏽 👋🏾 👋🏿',
        expected: [
            { token: '👋🏻', type: 'emoji' },
            { token: '👋🏼', type: 'emoji' },
            { token: '👋🏽', type: 'emoji' },
            { token: '👋🏾', type: 'emoji' },
            { token: '👋🏿', type: 'emoji' },
        ],
    },
};
exports.batchProcessorFixtures = {
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
exports.inputValidatorFixtures = {
    validSongInput: {
        interpreter: 'Test Artist',
        title: 'Test Song',
        spotify: 'https://www.spotify.com/watch?v=dQw4w9WgXcQ',
        genre: ['pop'],
        language: 'es',
        releaseDate: '2023-01-01',
        lyrics: 'Test lyrics',
    },
    validspotifyUrls: [
        'https://spotify.com/watch?v=dQw4w9WgXcQ',
        'https://www.spotify.com/watch?v=dQw4w9WgXcQ',
    ],
    invalidInputs: {
        emptyInterpreter: {
            interpreter: '',
            title: 'Test Song',
            spotify: 'https://www.spotify.com/watch?v=dQw4w9WgXcQ',
            genre: ['pop'],
            language: 'es',
            releaseDate: '2023-01-01',
            lyrics: 'Test lyrics',
        },
        invalidspotifyUrl: {
            interpreter: 'Test Artist',
            title: 'Test Song',
            spotify: 'invalid-url',
            genre: ['pop'],
            language: 'es',
            releaseDate: '2023-01-01',
            lyrics: 'Test lyrics',
        },
        invalidGenreFormat: {
            interpreter: 'Test Artist',
            title: 'Test Song',
            spotify: 'https://www.spotify.com/watch?v=dQw4w9WgXcQ',
            genre: 'pop',
            language: 'es',
            releaseDate: '2023-01-01',
            lyrics: 'Test lyrics',
        },
        emptyLyrics: {
            interpreter: 'Test Artist',
            title: 'Test Song',
            spotify: 'https://www.spotify.com/watch?v=dQw4w9WgXcQ',
            genre: ['pop'],
            language: 'es',
            releaseDate: '2023-01-01',
            lyrics: '',
        },
    },
};
exports.tokenProcessorFixtures = {
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
                    tokenType: types_1.TokenType.Word,
                    translations: { english: [] },
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
                    tokenType: types_1.TokenType.Word,
                    translations: { english: [] },
                    hasSpecialChar: false,
                    partOfSpeech: '',
                    isSlang: false,
                    isCognate: false,
                    isFalseCognate: false,
                },
                {
                    tokenId: 'token-!',
                    content: '!',
                    tokenType: types_1.TokenType.PunctuationSign,
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
                    tokenType: types_1.TokenType.Word,
                    translations: { english: [] },
                    hasSpecialChar: false,
                    partOfSpeech: '',
                    isSlang: false,
                    isCognate: false,
                    isFalseCognate: false,
                },
                {
                    tokenId: 'token-👋',
                    content: '👋',
                    tokenType: types_1.TokenType.Emoji,
                },
                {
                    tokenId: 'token-world',
                    content: 'world',
                    normalizedToken: 'world',
                    tokenType: types_1.TokenType.Word,
                    translations: { english: [] },
                    hasSpecialChar: false,
                    partOfSpeech: '',
                    isSlang: false,
                    isCognate: false,
                    isFalseCognate: false,
                },
                {
                    tokenId: 'token-!',
                    content: '!',
                    tokenType: types_1.TokenType.PunctuationSign,
                },
                {
                    tokenId: 'token-😀',
                    content: '😀',
                    tokenType: types_1.TokenType.Emoji,
                },
            ],
        },
        withSpecialChars: {
            input: '¡Hola señor!',
            expected: [
                {
                    tokenId: 'token-¡',
                    content: '¡',
                    tokenType: types_1.TokenType.PunctuationSign,
                },
                {
                    tokenId: 'token-hola',
                    content: 'Hola',
                    normalizedToken: 'hola',
                    tokenType: types_1.TokenType.Word,
                    translations: { english: [] },
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
                    tokenType: types_1.TokenType.Word,
                    translations: { english: [] },
                    hasSpecialChar: true,
                    partOfSpeech: '',
                    isSlang: false,
                    isCognate: false,
                    isFalseCognate: false,
                },
                {
                    tokenId: 'token-!',
                    content: '!',
                    tokenType: types_1.TokenType.PunctuationSign,
                },
            ],
        },
    },
};
exports.basicEnricherFixtures = {
    // Input context fixtures
    inputContext: {
        tokens: {
            all: [
                {
                    tokenId: 'token-1',
                    content: 'canta',
                    normalizedToken: 'canta',
                    tokenType: types_1.TokenType.Word,
                    translations: { english: ['sings'] },
                    hasSpecialChar: false,
                    partOfSpeech: types_1.PartOfSpeech.Verb,
                    isSlang: false,
                    isCognate: false,
                    isFalseCognate: false,
                },
                {
                    tokenId: 'token-2',
                    content: 'gato',
                    normalizedToken: 'gato',
                    tokenType: types_1.TokenType.Word,
                    translations: { english: ['cat'] },
                    hasSpecialChar: false,
                    partOfSpeech: types_1.PartOfSpeech.Noun,
                    isSlang: false,
                    isCognate: false,
                    isFalseCognate: false,
                },
                {
                    tokenId: 'token-3',
                    content: '.',
                    tokenType: types_1.TokenType.PunctuationSign,
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
                tokenType: types_1.TokenType.Word,
                translations: { english: ['sings'] },
                hasSpecialChar: false,
                partOfSpeech: types_1.PartOfSpeech.Verb,
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
                tokenType: types_1.TokenType.Word,
                translations: { english: ['cat'] },
                hasSpecialChar: false,
                partOfSpeech: types_1.PartOfSpeech.Noun,
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
                    tokenType: types_1.TokenType.Word,
                    translations: { english: ['sings'] },
                    hasSpecialChar: false,
                    partOfSpeech: types_1.PartOfSpeech.Verb,
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
                    tokenType: types_1.TokenType.Word,
                    translations: { english: ['cat'] },
                    hasSpecialChar: false,
                    partOfSpeech: types_1.PartOfSpeech.Noun,
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
                    tokenType: types_1.TokenType.PunctuationSign,
                },
            ],
            enriched: [
                {
                    tokenId: 'token-1',
                    content: 'canta',
                    normalizedToken: 'canta',
                    tokenType: types_1.TokenType.Word,
                    translations: { english: ['sings'] },
                    hasSpecialChar: false,
                    partOfSpeech: types_1.PartOfSpeech.Verb,
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
                    tokenType: types_1.TokenType.Word,
                    translations: { english: ['cat'] },
                    hasSpecialChar: false,
                    partOfSpeech: types_1.PartOfSpeech.Noun,
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
                    tokenType: types_1.TokenType.PunctuationSign,
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
                tokenType: types_1.TokenType.Word,
                partOfSpeech: types_1.PartOfSpeech.Verb,
            },
            {
                tokenId: 'token-2',
                content: 'gato',
                normalizedToken: 'gato',
                tokenType: types_1.TokenType.Word,
                partOfSpeech: types_1.PartOfSpeech.Noun,
            },
            {
                tokenId: 'token-3',
                content: 'rápido',
                normalizedToken: 'rapido',
                tokenType: types_1.TokenType.Word,
                partOfSpeech: types_1.PartOfSpeech.Adjective,
            },
            {
                tokenId: 'token-4',
                content: 'gato',
                normalizedToken: 'gato',
                tokenType: types_1.TokenType.Word,
                partOfSpeech: types_1.PartOfSpeech.Noun,
            },
        ],
        expected: {
            [types_1.PartOfSpeech.Verb]: 1,
            [types_1.PartOfSpeech.Noun]: 2,
            [types_1.PartOfSpeech.Adjective]: 1,
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
            tokenType: types_1.TokenType.Word,
            partOfSpeech: 'unknown',
            expectedGrammaticalInfo: {},
        },
        missingPartOfSpeech: {
            tokenId: 'token-missing',
            content: 'test',
            normalizedToken: 'test',
            tokenType: types_1.TokenType.Word,
            partOfSpeech: undefined,
        },
    },
};
exports.sentenceEnricherFixtures = {
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
