import {
	IEmoji,
	IPunctuationSign,
	ITextProcessor,
	IWord,
	TokenType,
} from '../lib/types';
import {errors} from '../lib/constants';
import {AddSongRequest, ISentence, ISong} from '../../../lib/types';
import emojiRegex from 'emoji-regex';
import {normalizeString} from './normalizeString';

// TODO: review what properties and methos should be public/private

export class TextProcessor implements ITextProcessor {
	private static readonly RATE_LIMITS = {
		REQUESTS_PER_MINUTE: 1,
		BATCH_SIZE: 10,
		DELAY_BETWEEN_BATCHES: 6000,
		RETRY_ATTEMPTS: 3,
	};

	public splittedParagraph: string[] = [];

	public formattedSentences: ISentence[] = [];

	public originalSentencesIds: string[] = [];

	public formattedTextEntry: ISong = {} as ISong;

	public tokenizedSentences: ISentence[] = [];

	public deduplicatedSentences: ISentence[] = []; // this is what I will send to ai for the translations

	public originalTokens: Array<IWord | IPunctuationSign | IEmoji> = [];

	public deduplicatedTokens: Array<IWord | IPunctuationSign | IEmoji> = []; // this is what I will send to ai for the translations

	constructor(public textData: AddSongRequest) {
		if (!textData.lyrics) {
			throw new Error(errors.invalidTextData);
		}
	}

	public splitParagraph = (string: string): string[] => {
		if (typeof string !== 'string') {
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
		return formattedSentences;
	};

	public getOriginalSentencesIds = (sentences: ISentence[]): string[] => {
		this.originalSentencesIds = sentences.map(sentence => sentence.sentenceId);
		return this.originalSentencesIds;
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
			lyrics: originalSentencesIds,
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
							spanish: token,
							normalizedToken: normalizeString(token),
							hasSpecialChar: token.toLowerCase() !== normalizeString(token),
							english: '',
							partOfSpeech: '',
							isSlang: false,
							isCognate: false,
							isFalseCognate: false,
							sentenceContext: sentence.content,
							tokenType: TokenType.Word,
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

	public deduplicateTokens(
		tokens: Array<IWord | IPunctuationSign | IEmoji>,
	): Array<IWord | IPunctuationSign | IEmoji> {
		const uniqueTokens = new Map<string, IWord | IPunctuationSign | IEmoji>();

		tokens.forEach(token => {
			if (!uniqueTokens.has(token.tokenId)) {
				uniqueTokens.set(token.tokenId, token);
			}
		});

		this.deduplicatedTokens = Array.from(uniqueTokens.values());
		return this.deduplicatedTokens;
	}

	public async processText(): Promise<void> {
		this.splitParagraph(this.textData.lyrics);

		this.formatSentences({
			sentences: this.splittedParagraph,
			author: this.textData.interpreter,
			title: this.textData.title,
		});

		this.getOriginalSentencesIds(this.formattedSentences);

		this.formatTextEntry(this.textData, this.originalSentencesIds);

		this.tokenizeSentences(this.formattedSentences);

		this.deduplicateSentences(this.tokenizedSentences);

		this.deduplicateTokens(this.originalTokens);
	}
}

// public enrichedSentences: ISentence[] = [];
// public enrichedTokensWithGrammaticalProperties: ISentence[] = [];
// public gramaticallyEnrichedSentences: ISentence[] = [];
// public processedText: ISentence[] = [];

// private async enrichSentences(sentences: ISentence[]): Promise<ISentence[]> {
// 	this.enrichedSentences = await batchProcessor<ISentence>({
// 		items: sentences,
// 		processingFn: enrichSentencesWithAI,
// 		batchSize: TextProcessor.RATE_LIMITS.BATCH_SIZE,
// 		options: {
// 			retryAttempts: TextProcessor.RATE_LIMITS.RETRY_ATTEMPTS,
// 			delayBetweenBatches: TextProcessor.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
// 			maxRequestsPerMinute: TextProcessor.RATE_LIMITS.REQUESTS_PER_MINUTE,
// 		},
// 	});

// 	return this.enrichedSentences;
// }

// private enrichTokensWithGrammaticalProperties(
// 	sentences: ISentence[],
// ): ISentence[] {
// 	this.enrichedTokensWithGrammaticalProperties = sentences.map(sentence => {
// 		sentence.tokens = sentence.tokens.map(token => {
// 			if (token.type === 'word') {
// 				const word = token.content as IWord;

// 				if (typeof word.partOfSpeech === 'string') {
// 					switch (word.partOfSpeech.toLowerCase()) {
// 						case PartOfSpeech.Verb:
// 							word.grammaticalInfo = {
// 								tense: '',
// 								mood: '',
// 								person: '',
// 								number: '',
// 								isRegular: false,
// 								infinitive: '',
// 								conjugationPattern: '',
// 								voice: '',
// 								verbClass: '',
// 								gerund: false,
// 								pastParticiple: false,
// 								auxiliary: '',
// 								verbRegularity: '',
// 								isReflexive: false,
// 							};
// 							break;

// 						case PartOfSpeech.Noun:
// 							word.grammaticalInfo = {
// 								gender: '',
// 								number: '',
// 								isProperNoun: false,
// 								diminutive: false,
// 							};
// 							break;

// 						case PartOfSpeech.Adjective:
// 							word.grammaticalInfo = {
// 								gender: '',
// 								number: '',
// 								isPastParticiple: false,
// 							};
// 							break;

// 						case PartOfSpeech.Adverb:
// 							word.grammaticalInfo = {
// 								adverbType: '',
// 								usesMente: false,
// 							};
// 							break;

// 						case PartOfSpeech.Article:
// 							word.grammaticalInfo = {
// 								articleType: '',
// 								gender: '',
// 								number: '',
// 							};
// 							break;

// 						case PartOfSpeech.Conjunction:
// 							word.grammaticalInfo = {
// 								conjunctionType: '',
// 								conjunctionFunction: '',
// 							};
// 							break;

// 						case PartOfSpeech.Determiner:
// 							word.grammaticalInfo = {
// 								determinerType: '',
// 								gender: '',
// 								number: '',
// 							};
// 							break;

// 						case PartOfSpeech.Interjection:
// 							word.grammaticalInfo = {
// 								interjectionEmotion: '',
// 								interjectoinType: '',
// 							};
// 							break;

// 						case PartOfSpeech.Numeral:
// 							word.grammaticalInfo = {
// 								numeralType: '',
// 								gender: '',
// 								number: '',
// 							};
// 							break;

// 						case PartOfSpeech.Preposition:
// 							word.grammaticalInfo = {
// 								prepositionType: '',
// 								contractsWith: '',
// 							};
// 							break;

// 						case PartOfSpeech.Pronoun:
// 							word.grammaticalInfo = {
// 								pronounType: '',
// 								person: '',
// 								gender: '',
// 								number: '',
// 								case: '',
// 								isReflexive: false,
// 								isReciprocal: false,
// 							};
// 							break;
// 					}
// 				}
// 			}
// 			return token;
// 		});
// 		return sentence;
// 	});

// 	return this.enrichedTokensWithGrammaticalProperties;
// }

// private async gramaticallyEnrichSentences(
// 	sentences: ISentence[],
// ): Promise<ISentence[]> {
// 	this.gramaticallyEnrichedSentences = await batchProcessor<ISentence>({
// 		items: sentences,
// 		processingFn: gramaticallyEnrichSentencesWithAI,
// 		batchSize: TextProcessor.RATE_LIMITS.BATCH_SIZE,
// 		options: {
// 			retryAttempts: TextProcessor.RATE_LIMITS.RETRY_ATTEMPTS,
// 			delayBetweenBatches: TextProcessor.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
// 			maxRequestsPerMinute: TextProcessor.RATE_LIMITS.REQUESTS_PER_MINUTE,
// 		},
// 	});

// 	return this.gramaticallyEnrichedSentences;
// }

// public async processText(): Promise<ISentence[]> {
// 	this.formatSentences(this.textData);
// 	await this.enrichSentences(this.formattedSentences);

// 	this.enrichTokensWithGrammaticalProperties(this.enrichedSentences);

// 	this.processedText = this.enrichTokensWithGrammaticalProperties(
// 		this.enrichedSentences,
// 	);

// 	return this.processedText;
//
