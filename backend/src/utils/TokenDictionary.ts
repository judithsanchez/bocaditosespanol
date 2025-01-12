import {readFile, writeFile} from 'fs/promises';
import {IWord, IPunctuationSign, IEmoji, TokenType} from '../lib/types';
import {existsSync} from 'fs';
import {Logger} from './Logger';

export class TokenDictionary {
	private tokens: any;
	private readonly filePath = 'data/tokens.json';
	private readonly logger = new Logger('TokenDictionary', true);

	async load() {
		this.logger.start('load');

		if (!existsSync(this.filePath)) {
			this.tokens = {
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
			this.logger.info('Initialized new tokens structure');
			this.logger.end('load');
			return;
		}

		try {
			const content = await readFile(this.filePath, 'utf-8');
			this.tokens = JSON.parse(content);
			this.logger.info('Loaded existing tokens from file', {
				path: this.filePath,
			});
		} catch (error) {
			this.logger.error('Failed to load tokens from file', error);
			throw error;
		}
		this.logger.end('load');
	}

	async save() {
		this.logger.start('save');
		try {
			await writeFile(this.filePath, JSON.stringify(this.tokens, null, 2));
			this.logger.info('Saved tokens to file', {path: this.filePath});
		} catch (error) {
			this.logger.error('Failed to save tokens to file', error);
			throw error;
		}
		this.logger.end('save');
	}

	categorizeToken(token: IWord | IPunctuationSign | IEmoji) {
		this.logger.start('categorizeToken');

		let result;
		if (token.tokenType === TokenType.Word) {
			const wordToken = token as IWord;
			const subcategory =
				typeof wordToken.partOfSpeech === 'string'
					? wordToken.partOfSpeech.toLowerCase()
					: 'uncategorized';

			result = {
				category: 'words',
				subcategory,
				token,
			};
		} else {
			result = {
				category:
					token.tokenType === TokenType.PunctuationSign
						? 'punctuationSigns'
						: 'emojis',
				token,
			};
		}

		this.logger.info('Token categorized', {tokenType: token.tokenType});
		this.logger.end('categorizeToken');
		return result;
	}

	async addToken(token: IWord | IPunctuationSign | IEmoji) {
		this.logger.start('addToken');

		const {
			category,
			subcategory,
			token: processedToken,
		} = this.categorizeToken(token);

		if (subcategory) {
			if (!this.tokens[category]) {
				this.tokens[category] = {};
			}
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

		this.logger.info('Token added', {tokenId: token.tokenId, category});
		this.logger.end('addToken');
	}

	async addTokens(tokens: Array<IWord | IPunctuationSign | IEmoji>) {
		this.logger.start('addTokens');
		try {
			for (const token of tokens) {
				await this.addToken(token);
			}
			await this.save();
			this.logger.info('Added tokens successfully', {count: tokens.length});
		} catch (error) {
			this.logger.error('Failed to add tokens', error);
			throw error;
		}
		this.logger.end('addTokens');
	}

	async getTokens(): Promise<Array<IWord | IPunctuationSign | IEmoji>> {
		this.logger.start('getTokens');
		try {
			await this.load();
			const allTokens: Array<IWord | IPunctuationSign | IEmoji> = [];

			Object.values(this.tokens.words).forEach((category: any) => {
				allTokens.push(...(Object.values(category) as Array<IWord>));
			});

			allTokens.push(
				...(Object.values(
					this.tokens.punctuationSigns,
				) as Array<IPunctuationSign>),
			);
			allTokens.push(...(Object.values(this.tokens.emojis) as Array<IEmoji>));

			this.logger.info('Retrieved tokens', {count: allTokens.length});
			this.logger.end('getTokens');
			return allTokens;
		} catch (error) {
			this.logger.error('Failed to get tokens', error);
			return [];
		}
	}
}
