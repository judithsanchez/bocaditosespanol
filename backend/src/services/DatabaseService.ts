import {readFile, writeFile, mkdir} from 'fs/promises';
import {existsSync} from 'fs';
import {join} from 'path';
import {ISentence, ISong} from '../../../lib/types';
import {IEmoji, IPunctuationSign, IWord, TokenType} from '../lib/types';
import {Logger} from '../utils/Logger';

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
	private readonly dbPath = join(__dirname, '../data');
	private readonly logger = new Logger('DatabaseService');

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
		this.initializeDataStructures();
	}

	private async initializeDataStructures() {
		if (!existsSync(this.dbPath)) {
			await mkdir(this.dbPath, {recursive: true});
		}
	}

	async saveSong(song: ISong): Promise<void> {
		const songs = (await this.readFile('songs.json')) || [];
		if (songs.some((s: ISong) => s.songId === song.songId)) {
			throw new Error(`Song with ID ${song.songId} already exists`);
		}
		await this.writeFile('songs.json', [...songs, song]);
	}

	async saveSentences(sentences: ISentence[]): Promise<void> {
		const existingSentences = (await this.readFile('sentences.json')) || [];
		const newSentences = sentences.filter(
			newSentence =>
				!existingSentences.some(
					(existing: ISentence) =>
						existing.sentenceId === newSentence.sentenceId,
				),
		);
		await this.writeFile('sentences.json', [
			...existingSentences,
			...newSentences,
		]);
	}

	async saveTokens(
		tokens: Array<IWord | IPunctuationSign | IEmoji>,
	): Promise<void> {
		// Load existing tokens or create new structure
		let currentTokens = await this.readFile('tokens.json');

		// Only initialize structure if file doesn't exist
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

		// Add new tokens while preserving existing ones
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

	private async readFile(filename: string) {
		try {
			const content = await readFile(join(this.dbPath, filename), 'utf-8');
			return JSON.parse(content);
		} catch (error) {
			return null;
		}
	}

	private async writeFile(filename: string, data: unknown) {
		await writeFile(join(this.dbPath, filename), JSON.stringify(data, null, 2));
	}
}
