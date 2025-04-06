import {
	ISentence,
	IWord,
	IPunctuationSign,
	IEmoji,
	TokenType,
	Token,
} from '@/lib/types/grammar';

interface TokenStorage {
	words: Record<string, IWord>;
	punctuationSigns: Record<string, IPunctuationSign>;
	emojis: Record<string, IEmoji>;
}

export class ReadDatabaseService {
	private getDataPath() {
		return '/home/judithsanchez/dev/bocaditosespanol/docs/data';
	}

	private getGitHubPagesUrl(filename: string) {
		return `https://judithsanchez.github.io/bocaditosespanol/data/${filename}`;
	}

	constructor() {
		console.log('Database read path:', this.getDataPath());
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
			try {
				const response = await fetch(this.getGitHubPagesUrl(filename));
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return await response.json();
			} catch (fetchError) {
				console.log(
					'Error fetching from GitHub Pages, falling back to local file:',
					fetchError,
				);
			}
		} catch (error) {
			console.log('Error reading file:', error);
			return null;
		}
	}

	async getSentences(): Promise<Record<string, ISentence[]>> {
		return (await this.readFile('sentences.json')) || {};
	}

	async getTextEntries(): Promise<Record<string, any>> {
		return (await this.readFile('text-entries.json')) || {};
	}
}
