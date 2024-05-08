// import {paragraphSplitter} from '@utils/paragraphSplitter';
// import {sentenceSplitter} from '@utils/sentenceSplitter';

const paragraphSplitter = (string: string): string[] => {
	const sentenceEndRegex: RegExp = /([.!?;])/;
	const sentences: string[] = string.split(sentenceEndRegex);
	const filteredSentences: string[] = [];
	for (let i: number = 0; i < sentences.length; i += 2) {
		const sentence: string = sentences[i].trim();
		const punctuation: string = sentences[i + 1] ? sentences[i + 1].trim() : '';
		const completeSentence: string = sentence + punctuation;
		if (completeSentence) {
			filteredSentences.push(completeSentence);
		}
	}
	return filteredSentences;
};

interface ISentence {
	sentence: string;
	tokens: string[];
}

const sentenceSplitter = (sentence: string): ISentence | null => {
	const tokens: string[] = sentence
		.split(/([.?!¡¿, ])/)
		.filter(token => token.trim() !== '');
	if (tokens.length > 0) {
		return {
			sentence: sentence,
			tokens: tokens,
		};
	} else {
		return null;
	}
};

const punctuationSigns: Set<string> = new Set([
	',',
	'.',
	'¡',
	'!',
	'¿',
	'?',
	':',
	';',
	"'",
	'(',
	')',
	'-',
	'_',
	'[',
	']',
	'{',
	'}',
	'/',
	'\\',
	'|',
	'@',
	'#',
	'$',
	'%',
	'&',
	'*',
	'+',
	'=',
	'<',
	'>',
	'~',
	'`',
	'"',
]);

// interface IToken {
// 	token: string;
// 	isPunctuationSign: boolean;
// }

// interface ISentence {
// 	tokens: IToken[];
// 	sentence: string;
// }

// class Token implements IToken {
// 	constructor(public token: string, public isPunctuationSign: boolean) {}
// }

// class Sentence implements ISentence {
// 	constructor(public tokens: IToken[], public sentence: string) {}
// }

const textProcessor = (array: string) => {
	const splitParagraph = paragraphSplitter(array);
	const processedText = [];

	for (let i = 0; i < splitParagraph.length; i += 1) {
		processedText.push(sentenceSplitter(splitParagraph[i]));
	}
	console.log(processedText[0]);
	console.log(processedText[0]?.tokens);
	console.log(processedText[1]);
	console.log(processedText[1]?.tokens);

	return processedText;
};
// "¡Hola! ¿Cómo estás? Estoy bien, gracias."
// ['¡', 'Hola', '!', '¿', 'Cómo', 'estás', '?', 'Estoy', 'bien', ',', 'gracias', '.']

textProcessor('¡Hola! ¿Cómo estás? Estoy bien, gracias.');
