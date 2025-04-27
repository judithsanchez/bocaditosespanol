import {writeFile, mkdir} from 'fs/promises';
import {existsSync} from 'fs';
import {join} from 'path';
import {DatabaseConfig} from '../config/DatabaseConfig';

import {
	TokenType,
	Token,
	IWord,
	IPunctuationSign,
	IEmoji,
} from '@/lib/types/token';
import {ISentence} from '@/lib/types/sentence';
import {
	ContentType,
	IContent,
	ISong,
	IBookExcerpt,
	IVideoTranscript,
} from '@/lib/types/content';
import {ReadDatabaseService} from './ReadDatabaseService';
import {TokenStorage, TextEntriesStorage} from '../types/database';

export class WriteDatabaseService {
	private readonly dataPath = DatabaseConfig.paths.data;

	private tokens: TokenStorage = {
		words: {},
		punctuationSigns: {},
		emojis: {},
	};

	private readService: ReadDatabaseService;

	constructor() {
		console.log('Database write path:', this.dataPath);
		this.readService = new ReadDatabaseService();
		this.initializeDataStructures();
	}

	private async initializeDataStructures() {
		if (!existsSync(this.dataPath)) {
			try {
				console.log(`Creating data directory: ${this.dataPath}`);
				await mkdir(this.dataPath, {recursive: true});
				console.log(`Successfully created data directory: ${this.dataPath}`);
			} catch (error) {
				console.error(
					`Failed to create data directory: ${this.dataPath}`,
					error,
				);
				throw new Error(
					`Initialization failed: Could not create data directory at ${this.dataPath}`,
				);
			}
		} else {
			console.log(`Data directory already exists: ${this.dataPath}`);
		}
	}

	async saveTextEntry(
		entry: IContent,
		contentType: ContentType,
	): Promise<void> {
		const entries =
			(await this.readService.getTextEntries()) as TextEntriesStorage;

		if (!entries[contentType]) {
			entries[contentType] = [];
		}

		if (contentType === ContentType.SONG) {
			entries[ContentType.SONG]?.push(entry as ISong);
		} else if (contentType === ContentType.BOOK_EXCERPT) {
			entries[ContentType.BOOK_EXCERPT]?.push(entry as IBookExcerpt);
		} else if (contentType === ContentType.VIDEO_TRANSCRIPT) {
			entries[ContentType.VIDEO_TRANSCRIPT]?.push(entry as IVideoTranscript);
		}

		await this.writeFile(DatabaseConfig.files.textEntries, entries);
	}

	async saveSentences(
		sentences: ISentence[],
		contentMetadata: {title: string; [key: string]: string},
	): Promise<void> {
		const existingSentences = await this.readService.getSentences();

		const metadataKey = Object.keys(contentMetadata).find(
			key => key !== 'title',
		);
		const secondaryValue = metadataKey ? contentMetadata[metadataKey] : '';

		const contentKey = `${contentMetadata.title
			.toLowerCase()
			.replace(/\s+/g, '-')}-${secondaryValue
			.toLowerCase()
			.replace(/\s+/g, '-')}`;

		existingSentences[contentKey] = sentences;

		await this.writeFile(DatabaseConfig.files.sentences, existingSentences);
	}

	async filterExistingTokens(tokens: Token[]): Promise<{
		existingTokens: Token[];
		newTokens: Token[];
	}> {
		const existingDbTokens = await this.readService.getTokens();
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
		console.log(`Attempting to save ${tokens.length} tokens.`);
		const startTime = Date.now();
		const currentTokensData = await this.readService.readFile(
			DatabaseConfig.files.tokens,
		);

		if (
			currentTokensData &&
			typeof currentTokensData === 'object' &&
			'words' in currentTokensData &&
			'punctuationSigns' in currentTokensData &&
			'emojis' in currentTokensData
		) {
			this.tokens = currentTokensData as TokenStorage;
		} else {
			console.warn(
				`Invalid or missing token data from ${DatabaseConfig.files.tokens}. Initializing with empty storage.`,
			);
			this.tokens = {
				words: {},
				punctuationSigns: {},
				emojis: {},
			};
		}

		for (const token of tokens) {
			await this.addToken(token);
		}

		await this.writeFile(DatabaseConfig.files.tokens, this.tokens);
		const endTime = Date.now();
		console.log(
			`Successfully saved tokens. Operation took ${endTime - startTime}ms.`,
		);
	}

	private areTokensEqual(token1: Token | undefined, token2: Token): boolean {
		if (!token1) {
			return false; // If existing token doesn't exist, they are not equal
		}
		// Deep comparison excluding lastUpdated
		const token1Compare = {...token1};
		const token2Compare = {...token2};
		delete (token1Compare as Partial<Token>).lastUpdated;
		delete (token2Compare as Partial<Token>).lastUpdated;
		return JSON.stringify(token1Compare) === JSON.stringify(token2Compare);
	}

	private async addToken(token: IWord | IPunctuationSign | IEmoji) {
		const tokenId = token.tokenId;
		const currentTime = Date.now();
		let existingToken: Token | undefined;
		let updated = false;

		if (token.tokenType === TokenType.Word) {
			existingToken = this.tokens.words[tokenId];
			if (!this.areTokensEqual(existingToken, token)) {
				this.tokens.words[tokenId] = {
					...(token as IWord),
					lastUpdated: currentTime,
				};
				updated = true;
			}
		} else if (token.tokenType === TokenType.PunctuationSign) {
			existingToken = this.tokens.punctuationSigns[tokenId];
			if (!this.areTokensEqual(existingToken, token)) {
				this.tokens.punctuationSigns[tokenId] = {
					...(token as IPunctuationSign),
					lastUpdated: currentTime,
				};
				updated = true;
			}
		} else if (token.tokenType === TokenType.Emoji) {
			existingToken = this.tokens.emojis[tokenId];
			if (!this.areTokensEqual(existingToken, token)) {
				this.tokens.emojis[tokenId] = {
					...(token as IEmoji),
					lastUpdated: currentTime,
				};
				updated = true;
			}
		}

		if (updated) {
			console.log(`Added/Updated token: ${tokenId} (${token.tokenType})`);
		} else if (existingToken) {
			// console.log(`Token already exists and is unchanged: ${tokenId} (${token.tokenType})`);
		} else {
			console.warn(
				`Attempted to add token with unknown type or failed comparison: ${JSON.stringify(
					token,
				)}`,
			);
		}
	}

	private async writeFile(filename: string, data: unknown) {
		const filePath = join(this.dataPath, filename);
		const dataString = JSON.stringify(data, null, 2);
		const dataSize = Buffer.byteLength(dataString, 'utf8');
		const startTime = Date.now();

		console.log(`Writing to ${filePath}`, {
			sizeBytes: dataSize,
			timestamp: new Date().toISOString(),
		});

		try {
			await writeFile(filePath, dataString);
			const endTime = Date.now();
			console.log(
				`Successfully wrote ${dataSize} bytes to ${filePath}. Operation took ${
					endTime - startTime
				}ms.`,
			);
		} catch (error) {
			const endTime = Date.now();
			console.error(
				`Failed to write to ${filePath}. Operation took ${
					endTime - startTime
				}ms.`,
				error,
			);
			throw error;
		}
	}
}
