import {writeFile, mkdir} from 'fs/promises';
import {existsSync} from 'fs';
import {join} from 'path';
import {DatabaseConfig} from '../config/DatabaseConfig';

import {
	TokenType,
	Token, // Union: EmojiToken | PunctuationToken | InitialWordToken | WordToken
	WordToken,
	PunctuationToken,
	EmojiToken,
	// IWord, // Old
	// IPunctuationSign, // Old
	// IEmoji, // Old
} from '@/lib/types/token';
import {ISentence} from '@/lib/types/sentence';
import {
	ContentType,
	ProcessedContent, // New base type
	SongContent, // New specific type
	BookExcerptContent, // New specific type
	VideoTranscriptContent, // New specific type
	ContentMetadata, // For the metadata property
	// IContent, // Old
	// ISong, // Old
	// IBookExcerpt, // Old
	// IVideoTranscript, // Old
} from '@/lib/types/content';
import {ReadDatabaseService} from './ReadDatabaseService';
import {TokenStorage, TextEntriesStorage} from '../types/database'; // These now use new types

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
		// entry: IContent, // Old
		entry: ProcessedContent & {metadata: ContentMetadata}, // Use new combined type
		contentType: ContentType, // contentType is also on entry, but passed for clarity/safety
	): Promise<void> {
		const entries =
			(await this.readService.getTextEntries()) as TextEntriesStorage; // TextEntriesStorage now uses new types

		if (!entries[contentType]) {
			entries[contentType] = [];
		}

		// The entry object should already be of the correct specific type (SongContent, etc.)
		// due to how it's constructed in ContentProcessingPipeline.
		// The TextEntriesStorage is also typed with these specific types.
		if (
			contentType === ContentType.SONG &&
			entry.contentType === ContentType.SONG
		) {
			entries[ContentType.SONG]?.push(entry as SongContent);
		} else if (
			contentType === ContentType.BOOK_EXCERPT &&
			entry.contentType === ContentType.BOOK_EXCERPT
		) {
			entries[ContentType.BOOK_EXCERPT]?.push(entry as BookExcerptContent);
		} else if (
			contentType === ContentType.VIDEO_TRANSCRIPT &&
			entry.contentType === ContentType.VIDEO_TRANSCRIPT
		) {
			entries[ContentType.VIDEO_TRANSCRIPT]?.push(
				entry as VideoTranscriptContent,
			);
		} else {
			// This case should ideally not be reached if called correctly from pipeline
			console.error(
				'Mismatched contentType in saveTextEntry or unhandled content type',
				{
					passedContentType: contentType,
					entryContentType: entry.contentType,
				},
			);
			// Potentially throw an error or handle as a generic entry if TextEntriesStorage supported it
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
		// tokens: Array<IWord | IPunctuationSign | IEmoji>, // Old
		tokens: Token[], // Use new Token union type
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

	private async addToken(token: Token) {
		// Changed parameter to Token
		const tokenId = token.tokenId;
		const currentTime = Date.now(); // This might be redundant if token.lastUpdated is already set

		// Check if token already exists in any category
		// this.tokens (TokenStorage) now uses WordToken, PunctuationToken, EmojiToken
		const existsInWords = tokenId in this.tokens.words;
		const existsInPunctuation = tokenId in this.tokens.punctuationSigns;
		const existsInEmojis = tokenId in this.tokens.emojis;

		// If token exists anywhere, don't add or update it
		// This logic might need review: what if a token is updated (e.g. senses)?
		// For now, keeping existing behavior: only add if truly new.
		if (existsInWords || existsInPunctuation || existsInEmojis) {
			return;
		}

		// Add new token. The token object should already have lastUpdated and processingState.
		// The spread operator will include all fields from the token.
		if (token.tokenType === TokenType.Word) {
			// Ensure it's a WordToken (fully processed) if that's what TokenStorage expects.
			// The pipeline finalizes tokens, so they should be WordToken if they have senses.
			// If it could be InitialWordToken, TokenStorage.words would need to accept InitialWordToken | WordToken.
			// Assuming pipeline provides WordToken for words to be saved.
			this.tokens.words[tokenId] = token as WordToken; // Cast to WordToken
		} else if (token.tokenType === TokenType.PunctuationSign) {
			this.tokens.punctuationSigns[tokenId] = token as PunctuationToken; // Cast to PunctuationToken
		} else if (token.tokenType === TokenType.Emoji) {
			this.tokens.emojis[tokenId] = token as EmojiToken; // Cast to EmojiToken
		}

		console.log(`Added new token: ${tokenId} (${token.tokenType})`);
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
