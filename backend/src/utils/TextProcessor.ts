import {
	IEmoji,
	IPunctuationSign,
	ITextProcessor,
	IWord,
	PartOfSpeech,
	StoredToken,
	TokenType,
} from '../lib/types';
import {errors} from '../lib/constants';
import {AddSongRequest, ISentence, ISong} from '../../../lib/types';
import emojiRegex from 'emoji-regex';
import {batchProcessor} from './batchProcessor';
import {enrichSentencesWithAI} from './enrichSentencesWithAI';
import {enrichWordTokens} from './enrichWordTokens';
import {enrichVerbTokens} from './enrichVerbTokens';
import {TokenDictionary} from './TokenDictionary';
import {initializeDataStructures} from './initializeDataStructures';
import {Logger} from './Logger';

// TODO: review what properties and methos should be public/private

export class TextProcessor implements ITextProcessor {
	private static readonly RATE_LIMITS = {
		REQUESTS_PER_MINUTE: 1,
		BATCH_SIZE: 10,
		DELAY_BETWEEN_BATCHES: 6000,
		RETRY_ATTEMPTS: 3,
	};

	private readonly tokenDictionary: TokenDictionary;

	private readonly logger = new Logger('TextProcessor', true);

	public splittedParagraph: string[] = [];

	public formattedSentences: ISentence[] = [];

	public originalSentencesIds: string[] = [];

	public formattedTextEntry: ISong = {} as ISong;

	public tokenizedSentences: ISentence[] = [];

	public deduplicatedSentences: ISentence[] = [];

	public originalTokens: Array<IWord | IPunctuationSign | IEmoji> = [];

	public deduplicatedTokens: Array<IWord | IPunctuationSign | IEmoji> = [];

	public enrichedSentences: ISentence[] = [];

	public enrichedTokens: Array<IWord | IPunctuationSign | IEmoji> = [];

	constructor(private readonly textData: AddSongRequest) {
		this.logger.start('constructor');
		if (!textData.lyrics) {
			this.logger.error('Invalid text data', new Error(errors.invalidTextData));
			throw new Error(errors.invalidTextData);
		}
		this.tokenDictionary = new TokenDictionary();
		this.logger.info('Text processor initialized', {
			title: textData.title,
			interpreter: textData.interpreter,
			lyricsLength: textData.lyrics.length,
		});
		this.logger.end('constructor');
	}

	public normalizeString = (string: string): string => {
		this.logger.start('normalizeString');

		if (typeof string !== 'string') {
			this.logger.error(
				'Invalid input type',
				new TypeError(errors.mustBeString),
			);
			throw new TypeError(errors.mustBeString);
		}

		const normalizedString = string
			.trim()
			.toLowerCase()
			.replace(/\s+/g, ' ')
			.replace(
				/[áéíóú]/g,
				accentedVowel => 'aeiou'['áéíóú'.indexOf(accentedVowel)],
			)
			.replace(/[ñ]/g, 'n')
			.replace(/[ü]/g, 'u');

		this.logger.end('normalizeString');
		return normalizedString;
	};

	public splitParagraph = (string: string): string[] => {
		this.logger.start('splitParagraph');

		if (typeof string !== 'string') {
			this.logger.error(
				'Invalid input type',
				new TypeError(errors.mustBeString),
			);
			throw new TypeError(errors.mustBeString);
		}

		const normalizedString = string
			.replace(/\s+/g, ' ')
			.replace(/[\n\r]+/g, ' ');

		const sentenceEndRegex: RegExp = /(?:[.!?]|\.{3})(?:\s+|$)/g;
		const sentences: string[] = [];
		let lastIndex = 0;

		for (let match of normalizedString.matchAll(sentenceEndRegex)) {
			if (match.index !== undefined) {
				const sentence = normalizedString
					.slice(lastIndex, match.index + match[0].length)
					.trim();
				if (sentence) {
					sentences.push(sentence);
				}
				lastIndex = match.index + match[0].length;
			}
		}

		const remainingText = normalizedString.slice(lastIndex).trim();
		if (remainingText) {
			sentences.push(remainingText);
		}

		this.splittedParagraph = sentences;
		this.logger.info('Paragraph split completed', {
			sentencesCount: sentences.length,
			firstSentence: sentences[0],
		});
		this.logger.end('splitParagraph');
		return sentences;
	};

	public formatSentences = ({
		sentences,
		author,
		title,
	}: {
		sentences: string[];
		author: string;
		title: string;
	}): ISentence[] => {
		this.logger.start('formatSentences');
		const sentenceMap = new Map<string, number>();

		const formattedSentences = sentences.map(sentence => {
			if (!sentenceMap.has(sentence)) {
				sentenceMap.set(sentence, sentenceMap.size + 1);
			}

			const sentenceNumber = sentenceMap.get(sentence);
			return {
				sentenceId: `sentence-${sentenceNumber}-${title
					.toLowerCase()
					.replace(/\s+/g, '-')}-${author.toLowerCase().replace(/\s+/g, '-')}`,
				content: sentence,
				translation: '',
				literalTranslation: '',
				tokenIds: [],
			};
		});

		this.formattedSentences = formattedSentences;
		this.logger.info('Sentences formatted', {
			totalSentences: formattedSentences.length,
			uniqueSentences: sentenceMap.size,
		});
		this.logger.end('formatSentences');
		return formattedSentences;
	};

	public formatTextEntry = (
		requestBody: AddSongRequest,
		originalSentencesIds: string[],
	): ISong => {
		const song: ISong = {
			songId: `${requestBody.title
				.toLowerCase()
				.replace(/\s+/g, '-')}-${requestBody.interpreter
				.toLowerCase()
				.replace(/\s+/g, '-')}`,
			metadata: {
				interpreter: requestBody.interpreter,
				feat: requestBody.feat,
				title: requestBody.title,
				youtube: requestBody.youtube,
				genre: requestBody.genre,
				language: requestBody.language,
				releaseDate: requestBody.releaseDate,
			},
			lyrics: this.originalSentencesIds,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		this.formattedTextEntry = song;
		return song;
	};

	public tokenizeSentences = (sentences: ISentence[]): ISentence[] => {
		const tokenizedSentences = sentences.map(sentence => {
			const trimmedContent = sentence.content.trim().replace(/\s+/g, ' ');

			const emojiPattern = emojiRegex();
			const pattern = `(${emojiPattern.source}|\\.{3}|[.?!¡¿,:;'"\\s-])`;
			const regex = new RegExp(pattern, 'gu');

			const tokens = trimmedContent
				.split(regex)
				.filter(token => token.trim() !== '')
				.map(token => {
					let tokenObj: IWord | IPunctuationSign | IEmoji;
					if (emojiRegex().test(token)) {
						tokenObj = {
							tokenId: `token-${token}`,
							content: token,
							tokenType: TokenType.Emoji,
						} as IEmoji;
					} else if (/^[.?!¡¿,:;'"\\s-]+$/.test(token)) {
						tokenObj = {
							tokenId: `token-${token}`,
							content: token,
							tokenType: TokenType.PunctuationSign,
						} as IPunctuationSign;
					} else {
						tokenObj = {
							tokenId: `token-${token.toLowerCase()}`,
							tokenType: TokenType.Word,
							originalText: token,
							normalizedToken: this.normalizeString(token),
							translations: {english: []},
							hasSpecialChar:
								token.toLowerCase() !== this.normalizeString(token),
							partOfSpeech: '',
							isSlang: false,
							isCognate: false,
							isFalseCognate: false,
						} as IWord;
					}
					this.originalTokens.push(tokenObj);
					return tokenObj;
				});

			return {
				...sentence,
				tokenIds: tokens.map(token => token.tokenId),
			};
		});

		this.tokenizedSentences = tokenizedSentences;
		return tokenizedSentences;
	};

	public deduplicateSentences(sentences: ISentence[]): ISentence[] {
		const uniqueSentences = new Map<string, ISentence>();

		sentences.forEach(sentence => {
			const key = sentence.content;
			if (!uniqueSentences.has(key)) {
				uniqueSentences.set(key, sentence);
			}
		});

		this.deduplicatedSentences = Array.from(uniqueSentences.values());
		return this.deduplicatedSentences;
	}

	public async deduplicateTokens(
		tokens: Array<IWord | IPunctuationSign | IEmoji>,
	): Promise<Array<IWord | IPunctuationSign | IEmoji>> {
		const uniqueTokensInText = new Map<
			string,
			IWord | IPunctuationSign | IEmoji
		>();

		tokens.forEach(token => {
			if (!uniqueTokensInText.has(token.tokenId)) {
				uniqueTokensInText.set(token.tokenId, token);
			}
		});

		let existingTokens: Array<IWord | IPunctuationSign | IEmoji> = [];
		try {
			existingTokens = await this.tokenDictionary.getTokens();
		} catch (error) {
			console.log('No existing tokens found, proceeding with new tokens');
		}

		const newTokensForProcessing = Array.from(
			uniqueTokensInText.values(),
		).filter(
			newToken =>
				!existingTokens.some(
					existingToken => existingToken.tokenId === newToken.tokenId,
				),
		);

		this.deduplicatedTokens = newTokensForProcessing;
		return newTokensForProcessing;
	}

	public async enrichSentences(sentences: ISentence[]): Promise<ISentence[]> {
		this.enrichedSentences = await batchProcessor<ISentence>({
			items: sentences,
			processingFn: enrichSentencesWithAI,
			batchSize: TextProcessor.RATE_LIMITS.BATCH_SIZE,
			options: {
				retryAttempts: TextProcessor.RATE_LIMITS.RETRY_ATTEMPTS,
				delayBetweenBatches: TextProcessor.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
				maxRequestsPerMinute: TextProcessor.RATE_LIMITS.REQUESTS_PER_MINUTE,
			},
		});

		return this.enrichedSentences;
	}

	public async enrichTokens(
		tokens: Array<IWord | IPunctuationSign | IEmoji>,
	): Promise<Array<IWord | IPunctuationSign | IEmoji>> {
		const wordTokens = tokens.filter(
			(token): token is IWord => token.tokenType === TokenType.Word,
		);

		const nonWordTokens = tokens.filter(
			token => token.tokenType !== TokenType.Word,
		);

		this.enrichedTokens = await batchProcessor<IWord>({
			items: wordTokens,
			processingFn: enrichWordTokens,
			batchSize: TextProcessor.RATE_LIMITS.BATCH_SIZE,
			options: {
				retryAttempts: TextProcessor.RATE_LIMITS.RETRY_ATTEMPTS,
				delayBetweenBatches: TextProcessor.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
				maxRequestsPerMinute: TextProcessor.RATE_LIMITS.REQUESTS_PER_MINUTE,
			},
		});

		// TODO: find a better way to add the properties
		const enrichedTokensWithGrammar = this.enrichedTokens.map(token => {
			if (
				token.tokenType === TokenType.Word &&
				typeof token.partOfSpeech === 'string'
			) {
				const word = token as IWord;
				switch (word.partOfSpeech) {
					case PartOfSpeech.Verb:
						word.grammaticalInfo = {
							tense: [],
							mood: '',
							person: [],
							number: '',
							isRegular: false,
							infinitive: '',
							// conjugationPattern: [],
							voice: '',
							verbClass: '',
							gerund: false,
							pastParticiple: false,
							verbRegularity: '',
							isReflexive: false,
						};
						break;
					case PartOfSpeech.Noun:
						word.grammaticalInfo = {
							gender: '',
							number: '',
							isProperNoun: false,
							diminutive: false,
						};
						break;

					case PartOfSpeech.Adjective:
						word.grammaticalInfo = {
							gender: '',
							number: '',
							isPastParticiple: false,
						};
						break;

					case PartOfSpeech.Adverb:
						word.grammaticalInfo = {
							adverbType: '',
							usesMente: false,
						};
						break;

					case PartOfSpeech.Article:
						word.grammaticalInfo = {
							articleType: '',
							gender: '',
							number: '',
						};
						break;

					case PartOfSpeech.Conjunction:
						word.grammaticalInfo = {
							conjunctionType: '',
							conjunctionFunction: '',
						};
						break;

					case PartOfSpeech.Determiner:
						word.grammaticalInfo = {
							determinerType: '',
							gender: '',
							number: '',
						};
						break;

					case PartOfSpeech.Interjection:
						word.grammaticalInfo = {
							interjectionEmotion: '',
							interjectoinType: '',
						};
						break;

					case PartOfSpeech.Numeral:
						word.grammaticalInfo = {
							numeralType: '',
							gender: '',
							number: '',
						};
						break;

					case PartOfSpeech.Preposition:
						word.grammaticalInfo = {
							prepositionType: '',
							contractsWith: '',
						};
						break;

					case PartOfSpeech.Pronoun:
						word.grammaticalInfo = {
							pronounType: '',
							person: '',
							gender: '',
							number: '',
							case: '',
							isReflexive: false,
							isReciprocal: false,
						};
						break;
				}
				return word;
			}
			return token;
		});

		const verbTokens = enrichedTokensWithGrammar.filter(
			(token): token is IWord =>
				token.tokenType === TokenType.Word &&
				typeof token.partOfSpeech === 'string' &&
				token.partOfSpeech === PartOfSpeech.Verb,
		);

		type SimplifiedVerb = Pick<
			IWord,
			'tokenId' | 'originalText' | 'grammaticalInfo'
		>;

		const filteredVerbTokens = verbTokens.map(
			token =>
				({
					tokenId: token.tokenId,
					originalText: token.originalText,
					grammaticalInfo: token.grammaticalInfo,
				} as SimplifiedVerb),
		);

		const enrichedVerbTokens = await batchProcessor<SimplifiedVerb>({
			items: filteredVerbTokens,
			processingFn: enrichVerbTokens,
			batchSize: TextProcessor.RATE_LIMITS.BATCH_SIZE,
			options: {
				retryAttempts: TextProcessor.RATE_LIMITS.RETRY_ATTEMPTS,
				delayBetweenBatches: TextProcessor.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
				maxRequestsPerMinute: TextProcessor.RATE_LIMITS.REQUESTS_PER_MINUTE,
			},
		});

		const mergedVerbTokens = verbTokens.map(originalToken => {
			const enrichedToken = enrichedVerbTokens.find(
				t => t.tokenId === originalToken.tokenId,
			);
			return {
				...originalToken,
				grammaticalInfo:
					enrichedToken?.grammaticalInfo || originalToken.grammaticalInfo,
			};
		});

		const nonVerbTokens = enrichedTokensWithGrammar.filter(
			token =>
				token.tokenType !== TokenType.Word ||
				token.partOfSpeech !== PartOfSpeech.Verb,
		);

		this.enrichedTokens = [
			...mergedVerbTokens,
			...nonVerbTokens,
			...nonWordTokens,
		];

		return this.enrichedTokens;
	}

	public async processText(): Promise<void> {
		await initializeDataStructures();
		await this.tokenDictionary.load();

		this.splittedParagraph = this.splitParagraph(this.textData.lyrics);
		this.formattedSentences = this.formatSentences({
			sentences: this.splittedParagraph,
			author: this.textData.interpreter,
			title: this.textData.title,
		});

		this.tokenizedSentences = this.tokenizeSentences(this.formattedSentences);
		this.deduplicatedTokens = await this.deduplicateTokens(this.originalTokens);
		this.enrichedTokens = await this.enrichTokens(this.deduplicatedTokens);

		await this.tokenDictionary.addTokens(this.enrichedTokens);
	}
}
