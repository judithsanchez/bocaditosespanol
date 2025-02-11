import emojiRegex from 'emoji-regex';
import {
	IEmoji,
	IPunctuationSign,
	IWord,
	TokenType,
} from '@bocaditosespanol/shared';
import {PipelineStep} from '../Pipeline';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {Logger} from '../../utils/index';
import {DatabaseService} from '../../services/DatabaseService';

export class TokenProcessorStep implements PipelineStep<SongProcessingContext> {
	private readonly logger = new Logger('TokenProcessorStep');

	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');

		const processedSentences = context.sentences.formatted.map(sentence => {
			const tokens = this.tokenizeSentence(sentence.content);

			context.tokens.all.push(...tokens);

			return {
				...sentence,
				tokenIds: tokens.map(token => token.tokenId),
			};
		});

		context.sentences.formatted = processedSentences;

		context.sentences.deduplicated = context.sentences.deduplicated.map(
			sentence => {
				const matchingSentence = processedSentences.find(
					processed => processed.content === sentence.content,
				);
				return {
					...sentence,
					tokenIds: matchingSentence?.tokenIds || [],
				};
			},
		);

		this.logger.info('Token processing completed', {
			totalTokens: context.tokens.all.length,
			wordTokens: context.tokens.all.filter(t => t.tokenType === TokenType.Word)
				.length,
			punctuationTokens: context.tokens.all.filter(
				t => t.tokenType === TokenType.PunctuationSign,
			).length,
			emojiTokens: context.tokens.all.filter(
				t => t.tokenType === TokenType.Emoji,
			).length,
		});

		context.tokens.deduplicated = this.deduplicateTokens(context.tokens.all);

		console.log(
			'deduplicated tokens:',
			JSON.stringify(context.tokens.deduplicated, null, 2),
		);

		const db = new DatabaseService();

		const filteredTokensAgainstDb = await db.filterExistingTokens(
			context.tokens.deduplicated,
		);

		console.log(
			'filteredTokensAgainstDb:',
			JSON.stringify(filteredTokensAgainstDb, null, 2),
		);

		context.tokens.newTokens = filteredTokensAgainstDb.newTokens;

		this.logger.end('process');
		return context;
	}

	private deduplicateTokens(
		tokens: Array<IWord | IPunctuationSign | IEmoji>,
	): Array<IWord | IPunctuationSign | IEmoji> {
		const uniqueTokens = new Map<string, IWord | IPunctuationSign | IEmoji>();
		tokens.forEach(token => {
			if (!uniqueTokens.has(token.tokenId)) {
				uniqueTokens.set(token.tokenId, token);
			}
		});
		return Array.from(uniqueTokens.values());
	}
	private tokenizeSentence(
		content: string,
	): Array<IWord | IPunctuationSign | IEmoji> {
		const trimmedContent = content.trim().replace(/\s+/g, ' ');
		const emojiPattern = emojiRegex();
		const pattern = `(${emojiPattern.source}|\\.{3}|[.?!¡¿,:;'"\\s-])`;
		const regex = new RegExp(pattern, 'gu');

		return trimmedContent
			.split(regex)
			.filter(token => token.trim() !== '')
			.map(token => this.createToken(token));
	}

	private createToken(token: string): IWord | IPunctuationSign | IEmoji {
		if (emojiRegex().test(token)) {
			return {
				tokenId: `token-${token}`,
				content: token,
				tokenType: TokenType.Emoji,
			} as IEmoji;
		}

		if (/^[.?!¡¿,:;'"\\s-]+$/.test(token)) {
			return {
				tokenId: `token-${token}`,
				content: token,
				tokenType: TokenType.PunctuationSign,
			} as IPunctuationSign;
		}

		return {
			tokenId: `token-${token.toLowerCase()}`,
			content: token,
			normalizedToken: token.toLowerCase(),
			tokenType: TokenType.Word,
			translations: {english: []},
			hasSpecialChar: /[áéíóúüñ]/i.test(token),
			partOfSpeech: '',
			isSlang: false,
			isCognate: false,
			isFalseCognate: false,
		} as IWord;
	}
}
