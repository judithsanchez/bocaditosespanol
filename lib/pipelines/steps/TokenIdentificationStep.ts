import {PipelineStep} from '../Pipeline';
import {ContentProcessingContext} from '../ContentProcessingPipeline';
import {Logger} from '../../utils/index';
import {WriteDatabaseService} from '../../services/WriteDatabaseService';
import {TokenFactory} from '../../factories/TokenFactory';
import {ISentence} from '@/lib/types/sentence';
import {
	EmojiToken,
	IEmoji,
	IPunctuationSign,
	IWord,
	PunctuationToken,
	Token,
	TokenType,
	WordToken,
} from '@/lib/types/token';

export class TokenIdentificationStep
	implements PipelineStep<ContentProcessingContext>
{
	private readonly logger = new Logger('TokenIdentificationStep');
	private readonly db: WriteDatabaseService;

	constructor(db: WriteDatabaseService) {
		this.db = db;
	}

	async process(
		context: ContentProcessingContext,
	): Promise<ContentProcessingContext> {
		this.logger.start('process');

		const processedSentences = this.processSentences(
			context.sentences.formatted,
		);
		context.sentences.formatted = processedSentences;

		context.sentences.deduplicated = this.updateDedupedSentences(
			context.sentences.deduplicated,
			processedSentences,
		);

		const allTokens = this.collectTokensFromSentences(processedSentences);
		context.tokens.deduplicated = this.deduplicateTokens(allTokens);

		const {newTokens} = await this.db.filterExistingTokens(
			context.tokens.deduplicated,
		);
		this.categorizeTokens(context, newTokens);

		this.logger.end('process');
		return context;
	}

	private processSentences(sentences: ISentence[]): ISentence[] {
		return sentences.map(sentence => ({
			...sentence,
			tokenIds: this.tokenizeSentence(sentence.content).map(
				token => token.tokenId,
			),
		}));
	}

	private tokenizeSentence(content: string): Token[] {
		const tokens = TokenFactory.splitIntoTokens(content);
		return tokens.map(token => TokenFactory.createToken(token));
	}
	private categorizeTokens(
		context: ContentProcessingContext,
		tokens: Token[],
	): void {
		context.tokens.words = tokens.filter(
			(token): token is WordToken => token.tokenType === TokenType.Word,
		) as IWord[];

		context.tokens.punctuationSigns = tokens.filter(
			(token): token is PunctuationToken =>
				token.tokenType === TokenType.PunctuationSign,
		) as IPunctuationSign[];

		context.tokens.emojis = tokens.filter(
			(token): token is EmojiToken => token.tokenType === TokenType.Emoji,
		) as IEmoji[];
	}
	private deduplicateTokens(tokens: Token[]): Token[] {
		const uniqueTokens = new Map<string, Token>();
		tokens.forEach(token => {
			if (!uniqueTokens.has(token.tokenId)) {
				uniqueTokens.set(token.tokenId, token);
			}
		});
		return Array.from(uniqueTokens.values());
	}

	private updateDedupedSentences(
		dedupedSentences: ISentence[],
		processedSentences: ISentence[],
	): ISentence[] {
		return dedupedSentences.map(dedupedSentence => {
			const matchingSentence = processedSentences.find(
				s => s.content === dedupedSentence.content,
			);
			return matchingSentence
				? {...dedupedSentence, tokenIds: matchingSentence.tokenIds}
				: dedupedSentence;
		});
	}

	private collectTokensFromSentences(sentences: ISentence[]): Token[] {
		return sentences.flatMap(sentence =>
			this.tokenizeSentence(sentence.content),
		);
	}
}
