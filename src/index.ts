import {ISentence} from './lib/types';
import {augmentSentence} from './utils/augmentSentence';
import {batchProcessor} from './utils/batchProcessor';

const testSentence = [
	{
		sentence: 'Tengo la camisa negra.',
		translation: '',
		tokens: [
			{
				token: {
					spanish: 'Tengo',
					normalizedToken: 'tengo',
					english: '',
					hasSpecialChar: false,
					wordType: '',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'la',
					normalizedToken: 'la',
					english: '',
					hasSpecialChar: false,
					wordType: '',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'camisa',
					normalizedToken: 'camisa',
					english: '',
					hasSpecialChar: false,
					wordType: '',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'negra',
					normalizedToken: 'negra',
					english: '',
					hasSpecialChar: false,
					wordType: '',
				},
				type: 'word',
			},
			{
				token: '.',
				type: 'punctuationSign',
			},
		],
	},
	{
		sentence: 'Hoy mi amor está de luto.',
		translation: '',
		tokens: [
			{
				token: {
					spanish: 'Hoy',
					normalizedToken: 'hoy',
					english: '',
					hasSpecialChar: false,
					wordType: 'adverb',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'mi',
					normalizedToken: 'mi',
					english: '',
					hasSpecialChar: false,
					wordType: 'possessive',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'amor',
					normalizedToken: 'amor',
					english: '',
					hasSpecialChar: false,
					wordType: 'noun',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'está',
					normalizedToken: 'esta',
					english: '',
					hasSpecialChar: true,
					wordType: 'verb',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'de',
					normalizedToken: 'de',
					english: '',
					hasSpecialChar: false,
					wordType: 'preposition',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'luto',
					normalizedToken: 'luto',
					english: '',
					hasSpecialChar: false,
					wordType: 'noun',
				},
				type: 'word',
			},
			{
				token: '.',
				type: 'punctuationSign',
			},
		],
	},
	{
		sentence: 'Hoy tengo en el alma una pena y es por culpa de tu embrujo.',
		translation: '',
		tokens: [
			{
				token: {
					spanish: 'Hoy',
					normalizedToken: 'hoy',
					english: '',
					hasSpecialChar: false,
					wordType: 'adverb',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'tengo',
					normalizedToken: 'tengo',
					english: '',
					hasSpecialChar: false,
					wordType: 'verb',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'en',
					normalizedToken: 'en',
					english: '',
					hasSpecialChar: false,
					wordType: 'preposition',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'el',
					normalizedToken: 'el',
					english: '',
					hasSpecialChar: false,
					wordType: 'article',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'alma',
					normalizedToken: 'alma',
					english: '',
					hasSpecialChar: false,
					wordType: 'noun',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'una',
					normalizedToken: 'una',
					english: '',
					hasSpecialChar: false,
					wordType: 'article',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'pena',
					normalizedToken: 'pena',
					english: '',
					hasSpecialChar: false,
					wordType: 'noun',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'y',
					normalizedToken: 'y',
					english: '',
					hasSpecialChar: false,
					wordType: 'conjunction',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'es',
					normalizedToken: 'es',
					english: '',
					hasSpecialChar: false,
					wordType: 'verb',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'por',
					normalizedToken: 'por',
					english: '',
					hasSpecialChar: false,
					wordType: 'preposition',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'culpa',
					normalizedToken: 'culpa',
					english: '',
					hasSpecialChar: false,
					wordType: 'noun',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'de',
					normalizedToken: 'de',
					english: '',
					hasSpecialChar: false,
					wordType: 'preposition',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'tu',
					normalizedToken: 'tu',
					english: '',
					hasSpecialChar: false,
					wordType: 'possessive',
				},
				type: 'word',
			},
			{
				token: {
					spanish: 'embrujo',
					normalizedToken: 'embrujo',
					english: '',
					hasSpecialChar: false,
					wordType: 'noun',
				},
				type: 'word',
			},
			{
				token: '.',
				type: 'punctuationSign',
			},
		],
	},
];

async function testAugmentation() {
	console.log(`🚀 Starting processing of sentences`);

	const augmentedSentences = await batchProcessor<ISentence>({
		items: testSentence as ISentence[],
		processingFn: augmentSentence,
		batchSize: 2,
		options: {
			retryAttempts: 3,
			delayBetweenBatches: 2000,
		},
	});

	console.log(`\n🎉 All sentences processed successfully!`);
	console.log('Final Results:', JSON.stringify(augmentedSentences, null, 2));
}
testAugmentation();
