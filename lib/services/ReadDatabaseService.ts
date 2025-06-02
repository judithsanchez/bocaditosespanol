import {ISentence} from '../types/sentence';
// import {IEmoji, IPunctuationSign, IWord, TokenType} from '../types/token'; // Old imports
import {
	Token, // New union type
	WordToken, // New specific type
	PunctuationToken, // New specific type
	EmojiToken, // New specific type
	TokenType,
} from '../types/token';
import {DatabaseConfig} from '../config/DatabaseConfig';
import {TokenStorage, TextEntriesStorage} from '../types/database'; // These now use new types

export class ReadDatabaseService {
	private readonly dataPath = DatabaseConfig.paths.data;
	private readonly githubPagesUrlBase = DatabaseConfig.paths.githubPages;

	constructor() {
		console.log('Database read path (local):', this.dataPath);
		console.log('Database read path (GitHub Pages):', this.githubPagesUrlBase);
	}

	private getGitHubPagesUrl(filename: string): string {
		return `${this.githubPagesUrlBase}/${filename}`;
	}

	async getTokens(): Promise<Token[]> {
		// Changed return type
		console.log(`Fetching tokens from ${DatabaseConfig.files.tokens}`);
		const startTime = Date.now();
		// TokenStorage now uses WordToken, PunctuationToken, EmojiToken
		const tokens = (await this.readFile(
			DatabaseConfig.files.tokens,
		)) as TokenStorage | null;

		if (!tokens) {
			console.warn(
				`No token data found or failed to read ${DatabaseConfig.files.tokens}. Returning empty array.`,
			);
			return [];
		}

		// allTokens should be Token[]
		const allTokens: Token[] = [
			...(Object.values(tokens.words) as WordToken[]), // Cast to WordToken[]
			...(Object.values(tokens.punctuationSigns) as PunctuationToken[]), // Cast to PunctuationToken[]
			...(Object.values(tokens.emojis) as EmojiToken[]), // Cast to EmojiToken[]
		];

		const sortedTokens = allTokens.sort((a, b) => {
			// Check if both are WordToken to access lastUpdated safely,
			// or ensure lastUpdated is on BaseToken if sorting all tokens by it.
			// Current BaseToken has lastUpdated as optional. WordToken has it (from initialWordTokenSchema).
			// PunctuationToken and EmojiToken also have it as optional from their schemas.
			// For robust sorting, ensure lastUpdated is consistently present or handle undefined.
			// Assuming lastUpdated is primarily relevant for WordTokens for this sort.
			if (a.tokenType === TokenType.Word && b.tokenType === TokenType.Word) {
				// Both a and b are WordToken here due to the check
				return (
					(b.lastUpdated || 0) - (a.lastUpdated || 0) // No need for 'as WordToken' cast here
				);
			}
			// Add sorting for other types or a default if needed
			// For now, only sorting words, others maintain relative order from concatenation.
			return 0;
		});

		const endTime = Date.now();
		console.log(
			`Successfully fetched and processed ${
				sortedTokens.length
			} tokens. Operation took ${endTime - startTime}ms.`,
		);
		return sortedTokens;
	}

	async readFile(filename: string): Promise<unknown | null> {
		const startTime = Date.now();

		try {
			// Always read local files if NEXT_PUBLIC_READ_LOCAL_FILES is true
			if (process.env.NEXT_PUBLIC_READ_LOCAL_FILES === 'true') {
				const fs = require('fs');
				const path = require('path');
				const localPath = path.join(this.dataPath, filename);
				console.log(`Reading local file: ${localPath}`);
				const data = JSON.parse(fs.readFileSync(localPath, 'utf8'));
				const endTime = Date.now();
				console.log(
					`Successfully read local file. Operation took ${
						endTime - startTime
					}ms.`,
				);
				return data;
			}

			// In production, fetch from GitHub Pages
			const githubUrl = this.getGitHubPagesUrl(filename);
			console.log(`Attempting to read file: ${filename} from ${githubUrl}`);
			const response = await fetch(githubUrl);

			if (!response.ok) {
				console.warn(
					`HTTP error fetching ${githubUrl}: Status ${response.status}. Falling back is not implemented yet.`,
				);
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			const endTime = Date.now();
			const dataSize = Buffer.byteLength(JSON.stringify(data), 'utf8');
			console.log(
				`Successfully fetched ${dataSize} bytes from ${githubUrl}. Operation took ${
					endTime - startTime
				}ms.`,
			);
			return data;
		} catch (error) {
			const endTime = Date.now();
			console.error(
				`Failed to read/fetch file. Operation took ${
					endTime - startTime
				}ms. Error:`,
				error instanceof Error ? error.message : error,
			);
			return null;
		}
	}

	async getSentences(): Promise<Record<string, ISentence[]>> {
		const sentences = await this.readFile(DatabaseConfig.files.sentences);
		return (sentences as Record<string, ISentence[]>) || {};
	}

	async getTextEntries(): Promise<TextEntriesStorage> {
		const entries = await this.readFile(DatabaseConfig.files.textEntries);
		return (entries as TextEntriesStorage) || {};
	}
}
