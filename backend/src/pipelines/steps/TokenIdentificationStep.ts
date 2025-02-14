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

export class TokenIdentificationStep
	implements PipelineStep<SongProcessingContext>
{
	private readonly logger = new Logger('TokenIdentificationStep');

	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');

		const tokenStats = {
			before: {
				all: context.tokens.all.length,
				words: context.tokens.words.length,
			},
		};

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

		context.tokens.deduplicated = this.deduplicateTokens(context.tokens.all);

		context.tokens.punctuationSigns = context.tokens.deduplicated.filter(
			(token): token is IPunctuationSign =>
				token.tokenType === TokenType.PunctuationSign,
		);
		context.tokens.emojis = context.tokens.deduplicated.filter(
			(token): token is IEmoji => token.tokenType === TokenType.Emoji,
		);

		context.tokens.deduplicated = context.tokens.deduplicated.filter(
			token => token.tokenType === TokenType.Word,
		);

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

		this.logger.info('Token identification completed', {
			before: tokenStats.before,
			after: {
				all: context.tokens.all.length,
				words: context.tokens.words.length,
				deduplicated: context.tokens.deduplicated.length,
				newTokens: context.tokens.newTokens.length,
			},
			sampleTokens: {
				first: context.tokens.all[0],
				last: context.tokens.all[context.tokens.all.length - 1],
			},
		});

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
			isSlang: false,
			isCognate: false,
			isFalseCognate: false,
			senses: [
				{
					content: '',
					senseId: '',
					tokenId: `token-${token.toLowerCase()}`,
					hasSpecialChar: false,
					translations: {english: []},
					partOfSpeech: '',
					grammaticalInfo: {},
					lastUpdated: Date.now(),
				},
			],
			lastUpdated: Date.now(),
		} as IWord;
	}
}
