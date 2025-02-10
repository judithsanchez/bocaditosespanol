import {PipelineStep} from '../Pipeline';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {Logger} from '../../utils/index';
import {batchProcessor} from '../../utils/batchProcessor';
import {enrichWordTokens} from '../../utils/enrichWordTokens';
import {IWord, PartOfSpeech, TokenType} from '@bocaditosespanol/shared';

export class BasicEnricherStep implements PipelineStep<SongProcessingContext> {
	private static readonly RATE_LIMITS = {
		BATCH_SIZE: 10,
		RETRY_ATTEMPTS: 3,
		DELAY_BETWEEN_BATCHES: 6000,
		REQUESTS_PER_MINUTE: 1,
	};

	private readonly logger = new Logger('BasicEnricherStep');

	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');

		const wordTokens = context.tokens.newTokens.filter(
			(token): token is IWord => token.tokenType === TokenType.Word,
		);

		this.logger.info('Starting basic token enrichment', {
			totalTokens: wordTokens.length,
		});

		const enrichedTokens = await batchProcessor<IWord>({
			items: wordTokens,
			processingFn: enrichWordTokens,
			batchSize: BasicEnricherStep.RATE_LIMITS.BATCH_SIZE,
			options: {
				retryAttempts: BasicEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
				delayBetweenBatches:
					BasicEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
				maxRequestsPerMinute: BasicEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
			},
		});

		const enrichedWithStructure = enrichedTokens.map(token =>
			this.addGrammaticalStructure(token),
		);

		context.tokens.enriched = [
			...enrichedWithStructure,
			...context.tokens.newTokens.filter(t => t.tokenType !== TokenType.Word),
		];

		this.logger.info('Basic enrichment completed', {
			enrichedTokens: enrichedWithStructure.length,
			byPartOfSpeech: this.getPartOfSpeechStats(enrichedWithStructure),
		});

		this.logger.end('process');
		return context;
	}

	private addGrammaticalStructure(token: IWord): IWord {
		if (!token.partOfSpeech || typeof token.partOfSpeech !== 'string')
			return token;

		const grammaticalInfo = this.getGrammaticalTemplate(token.partOfSpeech);
		return {
			...token,
			grammaticalInfo,
		};
	}

	private getGrammaticalTemplate(partOfSpeech: string): any {
		switch (partOfSpeech) {
			case PartOfSpeech.Verb:
				return {
					tense: [],
					mood: '',
					person: [],
					number: '',
					isRegular: false,
					infinitive: '',
					voice: '',
					verbClass: '',
					gerund: false,
					pastParticiple: false,
					verbRegularity: '',
					isReflexive: false,
				};
			case PartOfSpeech.Noun:
				return {
					gender: '',
					number: '',
					isProperNoun: false,
					diminutive: false,
				};
			default:
				return {};
		}
	}

	private getPartOfSpeechStats(tokens: IWord[]): Record<string, number> {
		return tokens.reduce(
			(acc, token) => {
				const pos = (token.partOfSpeech as string) || 'unknown';
				acc[pos] = (acc[pos] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);
	}
}
