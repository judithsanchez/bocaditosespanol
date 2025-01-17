import emojiRegex from 'emoji-regex';
import {IEmoji, IPunctuationSign, IWord, TokenType} from '../../lib/types';
import {PipelineStep} from '../Pipeline';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {Logger} from '../../utils/index';

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

		this.logger.end('process');
		return context;
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
