import {paragraphSplitter} from './paragraphSplitter';
import {tokenizeSentences} from './tokenizeSentences';
import {batchProcessor} from './batchProcessor';
import {ITextProcessor, IWord, PartOfSpeech} from '../lib/types';
import {enrichSentencesWithAI} from './enrichSentencesWithAI';
import {errors} from '../lib/constants';
import {ISentence} from '../../../lib/types';
import {gramaticallyEnrichSentencesWithAI} from './enrichTokenGrammaticalInfo';

export class TextProcessor implements ITextProcessor {
	private static readonly RATE_LIMITS = {
		REQUESTS_PER_MINUTE: 1,
		BATCH_SIZE: 10,
		DELAY_BETWEEN_BATCHES: 6000,
		RETRY_ATTEMPTS: 3,
	};

	public formattedSentences: ISentence[] = [];
	public enrichedSentences: ISentence[] = [];
	public enrichedTokensWithGrammaticalProperties: ISentence[] = [];
	public gramaticallyEnrichedSentences: ISentence[] = [];
	public processedText: ISentence[] = [];

	constructor(public textData: string) {
		if (!textData) {
			throw new Error(errors.invalidTextData);
		}
	}

	private formatSentences(text: string): ISentence[] {
		const splittedParagraph = paragraphSplitter(text);
		this.formattedSentences = splittedParagraph.map(sentence =>
			tokenizeSentences(sentence),
		);
		return this.formattedSentences;
	}

	private async enrichSentences(sentences: ISentence[]): Promise<ISentence[]> {
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

	private enrichTokensWithGrammaticalProperties(
		sentences: ISentence[],
	): ISentence[] {
		this.enrichedTokensWithGrammaticalProperties = sentences.map(sentence => {
			sentence.tokens = sentence.tokens.map(token => {
				if (token.type === 'word') {
					const word = token.content as IWord;

					if (typeof word.partOfSpeech === 'string') {
						switch (word.partOfSpeech.toLowerCase()) {
							case PartOfSpeech.Verb:
								word.grammaticalInfo = {
									tense: '',
									mood: '',
									person: '',
									number: '',
									isRegular: false,
									infinitive: '',
									conjugationPattern: '',
									voice: '',
									verbClass: '',
									gerund: false,
									pastParticiple: false,
									auxiliary: '',
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
					}
				}
				return token;
			});
			return sentence;
		});

		return this.enrichedTokensWithGrammaticalProperties;
	}

	private async gramaticallyEnrichSentences(
		sentences: ISentence[],
	): Promise<ISentence[]> {
		this.gramaticallyEnrichedSentences = await batchProcessor<ISentence>({
			items: sentences,
			processingFn: gramaticallyEnrichSentencesWithAI,
			batchSize: TextProcessor.RATE_LIMITS.BATCH_SIZE,
			options: {
				retryAttempts: TextProcessor.RATE_LIMITS.RETRY_ATTEMPTS,
				delayBetweenBatches: TextProcessor.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
				maxRequestsPerMinute: TextProcessor.RATE_LIMITS.REQUESTS_PER_MINUTE,
			},
		});

		return this.gramaticallyEnrichedSentences;
	}

	public async processText(): Promise<ISentence[]> {
		this.formatSentences(this.textData);
		await this.enrichSentences(this.formattedSentences);

		this.enrichTokensWithGrammaticalProperties(this.enrichedSentences);

		this.processedText = await this.gramaticallyEnrichSentences(
			this.enrichedTokensWithGrammaticalProperties,
		);

		return this.processedText;
	}
}
