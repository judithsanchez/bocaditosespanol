import {ISentence} from './lib/types';
import {augmentSentence} from './utils/aiLyricsProcessor';

const testSentence = {
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
};

async function testAugmentation() {
	const result = await augmentSentence(testSentence as ISentence);
	console.log('Test Result:', JSON.stringify(result, null, 2));
}

testAugmentation();
