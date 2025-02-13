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
	words: Record<string, IWord>;
	punctuationSigns: Record<string, IPunctuationSign>;
	emojis: Record<string, IEmoji>;
}

export class DatabaseService {
	private getDataPath() {
		if (process.env.NODE_ENV === 'production') {
			return '/data';
		}
		return join(__dirname, '..', '..', 'public/data');
	}

	private tokens: TokenStorage = {
		words: {},
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
				words: {},
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
		if (token.tokenType === TokenType.Word) {
			this.tokens.words[token.tokenId] = token as IWord;
		} else if (token.tokenType === TokenType.PunctuationSign) {
			this.tokens.punctuationSigns[token.tokenId] = token as IPunctuationSign;
		} else {
			this.tokens.emojis[token.tokenId] = token as IEmoji;
		}
	}

	async getTokens(): Promise<Array<IWord | IPunctuationSign | IEmoji>> {
		const tokens = (await this.readFile('tokens.json')) as TokenStorage;
		if (!tokens) return [];

		const allTokens: Array<IWord | IPunctuationSign | IEmoji> = [
			...(Object.values(tokens.words) as IWord[]),
			...(Object.values(tokens.punctuationSigns) as IPunctuationSign[]),
			...(Object.values(tokens.emojis) as IEmoji[]),
		];

		return allTokens.sort((a, b) => {
			if (a.tokenType === TokenType.Word && b.tokenType === TokenType.Word) {
				return (
					((b as IWord).lastUpdated || 0) - ((a as IWord).lastUpdated || 0)
				);
			}
			return 0;
		});
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
