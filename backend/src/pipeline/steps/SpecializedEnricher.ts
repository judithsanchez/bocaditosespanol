import {PipelineStep} from '../Pipeline';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {Logger} from '../../utils/Logger';
import {TokenType, PartOfSpeech, IWord} from '../../lib/types';
import {batchProcessor} from '../../utils/batchProcessor';
import {enrichVerbTokens} from '../../utils/enrichVerbTokens';
import {enrichNounTokens} from '../../utils/enrichNounTokens';

export class SpecializedEnricherStep
	implements PipelineStep<SongProcessingContext>
{
	private static readonly RATE_LIMITS = {
		BATCH_SIZE: 10,
		RETRY_ATTEMPTS: 3,
		DELAY_BETWEEN_BATCHES: 6000,
		REQUESTS_PER_MINUTE: 1,
	};

	private readonly logger = new Logger('SpecializedEnricherStep');

	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');

		// Get pre-enriched tokens
		const enrichedTokens = context.tokens.enriched;

		// Process verbs
		const verbTokens = this.filterTokensByType(
			enrichedTokens,
			PartOfSpeech.Verb,
		);
		const enrichedVerbs = await this.processVerbTokens(verbTokens);

		// Process nouns
		const nounTokens = this.filterTokensByType(
			enrichedTokens,
			PartOfSpeech.Noun,
		);
		const enrichedNouns = await this.processNounTokens(nounTokens);

		// Combine all tokens
		context.tokens.enriched = [
			...enrichedVerbs,
			...enrichedNouns,
			...enrichedTokens.filter(
				token =>
					token.tokenType !== TokenType.Word ||
					((token as IWord).partOfSpeech !== PartOfSpeech.Verb &&
						(token as IWord).partOfSpeech !== PartOfSpeech.Noun),
			),
		];

		this.logger.info('Specialized enrichment completed', {
			totalTokens: context.tokens.enriched.length,
			enrichedVerbs: enrichedVerbs.length,
			enrichedNouns: enrichedNouns.length,
		});

		this.logger.end('process');
		return context;
	}

	private filterTokensByType(
		tokens: Array<any>,
		partOfSpeech: string,
	): IWord[] {
		return tokens.filter(
			(token): token is IWord =>
				token.tokenType === TokenType.Word &&
				token.partOfSpeech === partOfSpeech,
		);
	}

	private async processVerbTokens(verbs: IWord[]): Promise<IWord[]> {
		if (!verbs.length) return [];

		const simplifiedVerbs = verbs.map(token => ({
			tokenId: token.tokenId,
			originalText: token.originalText,
			grammaticalInfo: token.grammaticalInfo,
		}));

		const enrichedVerbs = await batchProcessor({
			items: simplifiedVerbs,
			processingFn: enrichVerbTokens,
			batchSize: SpecializedEnricherStep.RATE_LIMITS.BATCH_SIZE,
			options: {
				retryAttempts: SpecializedEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
				delayBetweenBatches:
					SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
				maxRequestsPerMinute:
					SpecializedEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
			},
		});

		return verbs.map(originalToken => ({
			...originalToken,
			grammaticalInfo:
				enrichedVerbs.find(t => t.tokenId === originalToken.tokenId)
					?.grammaticalInfo || originalToken.grammaticalInfo,
		}));
	}

	private async processNounTokens(nouns: IWord[]): Promise<IWord[]> {
		if (!nouns.length) return [];

		const simplifiedNouns = nouns.map(token => ({
			tokenId: token.tokenId,
			originalText: token.originalText,
			grammaticalInfo: token.grammaticalInfo,
		}));

		const enrichedNouns = await batchProcessor({
			items: simplifiedNouns,
			processingFn: enrichNounTokens,
			batchSize: SpecializedEnricherStep.RATE_LIMITS.BATCH_SIZE,
			options: {
				retryAttempts: SpecializedEnricherStep.RATE_LIMITS.RETRY_ATTEMPTS,
				delayBetweenBatches:
					SpecializedEnricherStep.RATE_LIMITS.DELAY_BETWEEN_BATCHES,
				maxRequestsPerMinute:
					SpecializedEnricherStep.RATE_LIMITS.REQUESTS_PER_MINUTE,
			},
		});

		return nouns.map(originalToken => ({
			...originalToken,
			grammaticalInfo:
				enrichedNouns.find(t => t.tokenId === originalToken.tokenId)
					?.grammaticalInfo || originalToken.grammaticalInfo,
		}));
	}
}
