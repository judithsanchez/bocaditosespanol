interface IToken {
	token: string;
	isPunctuationSign: boolean;
}

interface ISentence {
	tokens: IToken[];
	sentence: string;
}

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

class TextProcessor {
	processedText: ISentence[];

	constructor(text: string) {
		if (typeof text !== 'string') {
			throw new Error('TextProcessor can only be initialized with a string.');
		}

		if (text.trim().length === 0) {
			throw new Error(
				'TextProcessor cannot be initialized with an empty string.',
			);
		}

		this.processedText = this.processText(text);
	}

	private processText(text: string): ISentence[] {
		const sentences = this.tokenizeSentences(text);
		if (sentences === null) {
			throw new Error('No valid sentences found in the input text.');
		}

		const result = sentences.map(sentence => ({
			tokens: this.processWords(sentence),
			sentence: sentence,
		}));
		return result;
	}

	private tokenizeSentences(text: string): string[] | null {
		return text.split(/([.?!¡¿, ])/).filter(token => token.trim() !== '');
	}

	private processWords(words: string[]): IToken[] {
		return words.map(word => ({
			token: word,
			isPunctuationSign: this.isPunctuation(word),
		}));
	}

	private isPunctuation(char: string): boolean {
		return punctuationSigns.has(char);
	}
}

const testSentence = new TextProcessor('¡H');
console.log(testSentence.processedText);
console.log(testSentence.processedText[0]);

console.log(testSentence.processedText[2]);

export {ISentence, TextProcessor};

// class TextProcessor {
// 	processedText: ISentence[];

// 	constructor(text: string) {
// 		if (typeof text !== 'string') {
// 			throw new Error('TextProcessor can only be initialized with a string.');
// 		}

// 		if (text.trim().length === 0) {
// 			throw new Error(
// 				'TextProcessor cannot be initialized with an empty string.',
// 			);
// 		}

// 		this.processedText = this.processText(text);
// 	}

// 	private processText(text: string): ISentence[] {
// 		const sentences = this.tokenizeSentences(text);
// 		if (sentences === null) {
// 			throw new Error('No valid sentences found in the input text.');
// 		}

// 		const result = sentences.map(sentence => ({
// 			tokens: this.tokenizeSentence(sentence),
// 			sentence: sentence,
// 		}));
// 		return result;
// 	}

// 	private tokenizeSentences(text: string): string[] | null {
// 		return text.split(/([.?!¡¿, ])/).filter(token => token.trim() !== '');
// 	}

// 	private tokenizeSentence(sentence: string): IToken[] {
// 		const words = sentence.split(' ');
// 		const tokenizedSentence: IToken[] = [];

// 		for (const word of words) {
// 			const tokens = this.tokenizeWord(word);

// 			for (const token of tokens) {
// 				const isPunctuationSign = this.isPunctuation(token);

// 				const tokenObject: IToken = {
// 					token,
// 					isPunctuationSign,
// 				};

// 				tokenizedSentence.push(tokenObject);
// 			}
// 		}
// 		return tokenizedSentence;
// 	}

// 	private tokenizeWord(word: string): string[] {
// 		const tokenizedWord: string[] = [];
// 		let currentToken = '';

// 		for (const char of word) {
// 			if (this.isPunctuation(char)) {
// 				if (currentToken.length > 0) {
// 					tokenizedWord.push(currentToken);
// 					currentToken = '';
// 				}
// 				tokenizedWord.push(char);
// 			} else {
// 				currentToken += char;
// 			}
// 		}

// 		if (currentToken.length > 0) {
// 			tokenizedWord.push(currentToken);
// 		}

// 		return tokenizedWord;
// 	}

// 	private isPunctuation(char: string): boolean {
// 		return punctuationSigns.has(char);
// 	}
// }
