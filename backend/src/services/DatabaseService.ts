import {readFile, writeFile, mkdir} from 'fs/promises';
import {existsSync} from 'fs';
import {join} from 'path';

import {
	ISentence,
	IWord,
	IPunctuationSign,
	IEmoji,
	ISong,
	TokenType,
} from '@bocaditosespanol/shared';

interface TokenStorage {
	words: {
		nouns: Record<string, IWord>;
		verbs: Record<string, IWord>;
		adjectives: Record<string, IWord>;
		adverbs: Record<string, IWord>;
		pronouns: Record<string, IWord>;
		determiners: Record<string, IWord>;
		articles: Record<string, IWord>;
		prepositions: Record<string, IWord>;
		conjunctions: Record<string, IWord>;
		interjections: Record<string, IWord>;
		numerals: Record<string, IWord>;
		[key: string]: Record<string, IWord>;
	};
	punctuationSigns: Record<string, IPunctuationSign>;
	emojis: Record<string, IEmoji>;
	[key: string]: any;
}

export class DatabaseService {
	private getDataPath() {
		if (process.env.NODE_ENV === 'production') {
			return '/data';
		}
		return join(__dirname, '..', '..', 'public/data');
	}

	private tokens: TokenStorage = {
		words: {
			nouns: {},
			verbs: {},
			adjectives: {},
			adverbs: {},
			pronouns: {},
			determiners: {},
			articles: {},
			prepositions: {},
			conjunctions: {},
			interjections: {},
			numerals: {},
		},
		punctuationSigns: {},
		emojis: {},
	};

	constructor() {
		console.log('Database path:', this.getDataPath());
		this.initializeDataStructures();
	}

	private async initializeDataStructures() {
		if (!existsSync(this.getDataPath())) {
			await mkdir(this.getDataPath(), {recursive: true});
		}
	}

	async saveTextEntry(
		entry: ISong,
		contentType: 'song' | 'transcript' | 'podcast',
	): Promise<void> {
		const entries = (await this.readFile('text-entries.json')) || {};

		if (!entries[contentType]) {
			entries[contentType] = [];
		}

		entries[contentType].push(entry);

		await this.writeFile('text-entries.json', entries);
	}

	async saveSentences(
		sentences: ISentence[],
		songMetadata: {title: string; interpreter: string},
	): Promise<void> {
		const existingSentences = (await this.readFile('sentences.json')) || {};

		const songKey = `${songMetadata.title
			.toLowerCase()
			.replace(/\s+/g, '-')}-${songMetadata.interpreter
			.toLowerCase()
			.replace(/\s+/g, '-')}`;

		existingSentences[songKey] = sentences;

		await this.writeFile('sentences.json', existingSentences);
	}

	async filterExistingTokens(
		tokens: Array<IWord | IPunctuationSign | IEmoji>,
	): Promise<{
		existingTokens: Array<IWord | IPunctuationSign | IEmoji>;
		newTokens: Array<IWord | IPunctuationSign | IEmoji>;
	}> {
		const existingDbTokens = await this.getTokens();
		const existingTokenIds = new Set(existingDbTokens.map(t => t.tokenId));

		return {
			existingTokens: tokens.filter(token =>
				existingTokenIds.has(token.tokenId),
			),
			newTokens: tokens.filter(token => !existingTokenIds.has(token.tokenId)),
		};
	}

	async saveTokens(
		tokens: Array<IWord | IPunctuationSign | IEmoji>,
	): Promise<void> {
		let currentTokens = await this.readFile('tokens.json');

		if (!currentTokens) {
			currentTokens = {
				words: {
					nouns: {},
					verbs: {},
					adjectives: {},
					adverbs: {},
					pronouns: {},
					determiners: {},
					articles: {},
					prepositions: {},
					conjunctions: {},
					interjections: {},
					numerals: {},
				},
				punctuationSigns: {},
				emojis: {},
			};
		}

		this.tokens = currentTokens;

		for (const token of tokens) {
			await this.addToken(token);
		}

		await this.writeFile('tokens.json', this.tokens);
	}

	private async addToken(token: IWord | IPunctuationSign | IEmoji) {
		const {
			category,
			subcategory,
			token: processedToken,
		} = this.categorizeToken(token);

		if (subcategory) {
			if (!this.tokens[category][subcategory]) {
				this.tokens[category][subcategory] = {};
			}
			this.tokens[category][subcategory][token.tokenId] = processedToken;
		} else {
			if (!this.tokens[category]) {
				this.tokens[category] = {};
			}
			this.tokens[category][token.tokenId] = processedToken;
		}
	}

	private categorizeToken(token: IWord | IPunctuationSign | IEmoji) {
		const partOfSpeechMap: Record<string, string> = {
			noun: 'nouns',
			verb: 'verbs',
			adjective: 'adjectives',
			adverb: 'adverbs',
			pronoun: 'pronouns',
			determiner: 'determiners',
			article: 'articles',
			preposition: 'prepositions',
			conjunction: 'conjunctions',
			interjection: 'interjections',
			numeral: 'numerals',
		};

		if (token.tokenType === TokenType.Word) {
			const wordToken = token as IWord;
			const subcategory =
				partOfSpeechMap[wordToken.partOfSpeech as keyof typeof partOfSpeechMap];
			return {
				category: 'words',
				subcategory,
				token,
			};
		}
		return {
			category:
				token.tokenType === TokenType.PunctuationSign
					? 'punctuationSigns'
					: 'emojis',
			token,
		};
	}

	async getTokens(): Promise<Array<IWord | IPunctuationSign | IEmoji>> {
		const tokens = await this.readFile('tokens.json');
		if (!tokens) return [];

		const allTokens: Array<IWord | IPunctuationSign | IEmoji> = [];

		const wordCategories = tokens.words as Record<
			string,
			Record<string, IWord>
		>;
		Object.values(wordCategories).forEach(category => {
			allTokens.push(...(Object.values(category) as IWord[]));
		});

		const punctuationSigns = tokens.punctuationSigns as Record<
			string,
			IPunctuationSign
		>;
		const emojis = tokens.emojis as Record<string, IEmoji>;

		allTokens.push(...Object.values(punctuationSigns));
		allTokens.push(...Object.values(emojis));

		return allTokens;
	}

	async readFile(filename: string) {
		try {
			const filePath = join(this.getDataPath(), filename);
			const content = await readFile(filePath, 'utf-8');
			return JSON.parse(content);
		} catch (error) {
			console.log('Error reading file:', error);
			return null;
		}
	}

	private async writeFile(filename: string, data: unknown) {
		await writeFile(
			join(this.getDataPath(), filename),
			JSON.stringify(data, null, 2),
		);
	}
}
