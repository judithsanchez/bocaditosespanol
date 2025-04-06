import {writeFile, mkdir} from 'fs/promises';
import {existsSync} from 'fs';
import {join} from 'path';

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

interface TokenStorage {
	words: Record<string, IWord>;
	punctuationSigns: Record<string, IPunctuationSign>;
	emojis: Record<string, IEmoji>;
}

interface TextEntriesStorage {
	[ContentType.SONG]?: ISong[];
	[ContentType.BOOK_EXCERPT]?: IBookExcerpt[];
	[ContentType.VIDEO_TRANSCRIPT]?: IVideoTranscript[];
}

export class WriteDatabaseService {
	private getDataPath() {
		return '/home/judithsanchez/dev/bocaditosespanol/docs/data';
	}

	private tokens: TokenStorage = {
		words: {},
		punctuationSigns: {},
		emojis: {},
	};

	private readService: ReadDatabaseService;

	constructor() {
		console.log('Database write path:', this.getDataPath());
		this.readService = new ReadDatabaseService();
		this.initializeDataStructures();
	}

	private async initializeDataStructures() {
		if (!existsSync(this.getDataPath())) {
			await mkdir(this.getDataPath(), {recursive: true});
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

		await this.writeFile('text-entries.json', entries);
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

		await this.writeFile('sentences.json', existingSentences);
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
		const currentTokens = await this.readService.readFile('tokens.json');

		this.tokens = currentTokens || {
			words: {},
			punctuationSigns: {},
			emojis: {},
		};

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
		} else if (token.tokenType === TokenType.Emoji) {
			this.tokens.emojis[token.tokenId] = token as IEmoji;
		}
	}

	private async writeFile(filename: string, data: unknown) {
		await writeFile(
			join(this.getDataPath(), filename),
			JSON.stringify(data, null, 2),
		);
	}
}
