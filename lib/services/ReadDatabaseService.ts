import {ISentence} from '../types/sentence';
import {IEmoji, IPunctuationSign, IWord, TokenType} from '../types/token';
import {DatabaseConfig} from '../config/DatabaseConfig';
import {TokenStorage, TextEntriesStorage} from '../types/database';

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

	async getTokens(): Promise<Array<IWord | IPunctuationSign | IEmoji>> {
		console.log(`Fetching tokens from ${DatabaseConfig.files.tokens}`);
		const startTime = Date.now();
		const tokens = (await this.readFile(
			DatabaseConfig.files.tokens,
		)) as TokenStorage | null;

		if (!tokens) {
			console.warn(
				`No token data found or failed to read ${DatabaseConfig.files.tokens}. Returning empty array.`,
			);
			return [];
		}

		const allTokens: Array<IWord | IPunctuationSign | IEmoji> = [
			...(Object.values(tokens.words) as IWord[]),
			...(Object.values(tokens.punctuationSigns) as IPunctuationSign[]),
			...(Object.values(tokens.emojis) as IEmoji[]),
		];

		const sortedTokens = allTokens.sort((a, b) => {
			if (a.tokenType === TokenType.Word && b.tokenType === TokenType.Word) {
				return (
					((b as IWord).lastUpdated || 0) - ((a as IWord).lastUpdated || 0)
				);
			}
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
		const githubUrl = this.getGitHubPagesUrl(filename);
		const startTime = Date.now();
		console.log(`Attempting to read file: ${filename} from ${githubUrl}`);

		try {
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
				`Failed to fetch or parse ${githubUrl}. Operation took ${
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
