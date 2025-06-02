import {PipelineStep} from '../Pipeline';
// Use generic context type
import {ContentProcessingContext} from '../ContentProcessingPipeline';
import {Logger} from '../../utils/index';
import {BatchProcessor} from '../../utils/BatchProcessor';
import {
	WordToken,
	InitialWordToken,
	// ISense, // ISense is in lib/types/sense.ts
	TokenType,
} from '@/lib/types/token'; // Use new token types
import {ISense} from '@/lib/types/sense'; // Correct import for ISense
import {ProcessingStage} from '@/lib/types/processing'; // Import ProcessingStage
import {GenericAIEnricher} from '../../utils/GenericAIEnricher';
import {TokenAIEnrichmentFactory} from '../../factories/TokenAIEnrichmentFactory';
import {TokenAIEnrichmentInstructionFactory} from '../../factories/TokenAIEnrichmentInstructionFactory';
import {AIProviderFactory} from '../../factories/index';
import {
	ACTIVE_PROVIDER,
	AIStepType,
	PROVIDER_BATCH_CONFIGS,
} from '../../config/AIConfig';

export class SensesEnrichmentStep
	implements PipelineStep<ContentProcessingContext>
{
	private readonly logger = new Logger('SensesEnrichmentStep');
	private readonly enricher: GenericAIEnricher;

	constructor() {
		const provider = AIProviderFactory.getInstance().getProvider(
			AIStepType.SENSES_ENRICHMENT,
		);
		this.enricher = new GenericAIEnricher(provider);
	}

	async process(
		context: ContentProcessingContext,
	): Promise<ContentProcessingContext> {
		this.logger.start('process');

		if (!context.contentType) {
			throw new Error(
				'ContentType is missing in the processing context. SensesEnrichmentStep cannot proceed.',
			);
		}

		this.logger.info('Starting senses enrichment', {
			tokensToProcess: context.tokens.words.length,
			firstToken: context.tokens.words[0]?.content,
			lastToken: context.tokens.words[context.tokens.words.length - 1]?.content,
		});

		const batchConfig = PROVIDER_BATCH_CONFIGS[ACTIVE_PROVIDER.type];
		// context.tokens.words is WordToken[]. BatchProcessor should operate on WordToken or InitialWordToken.
		// Let's assume the input to this step can be InitialWordToken and output is WordToken.
		// However, context.tokens.words is typed as WordToken[]. This implies it might already have senses.
		// For now, let's stick to WordToken as the primary type being manipulated.
		const batchProcessor = new BatchProcessor<WordToken>(batchConfig);

		// The enricher might return objects that are not yet full WordTokens, or might fail.
		// The result of enricher.enrich might be Promise<(Partial<WordToken> & {tokenId: string})[] | {error: any}>
		// We need to handle this carefully. For now, assume it returns something that can be mapped to WordToken.
		const rawEnrichedData = await batchProcessor.process({
			items: context.tokens.words, // These are WordToken[]
			processingFn: async (batch: WordToken[]): Promise<WordToken[]> => {
				// Changed declared return type to Promise<WordToken[]>
				const schema = TokenAIEnrichmentFactory.createSenseSchema();
				const instruction =
					TokenAIEnrichmentInstructionFactory.createSensesInstruction();
				try {
					// Assuming enricher.enrich returns an array of objects with at least tokenId and senses
					const aiResults = (await this.enricher.enrich({
						input: batch, // Pass WordToken[]
						schema,
						instruction,
						// Ensure enricher.enrich is expected to return Array<{tokenId: string, senses: ISense[], ...other partial fields}>
					})) as Array<
						Partial<WordToken> & {tokenId: string; senses?: ISense[]}
					>;

					// Map AI results back to full WordToken objects, merging with original tokens
					const aiResultsMap = new Map(aiResults.map(r => [r.tokenId, r]));
					return batch.map(originalToken => {
						const aiData = aiResultsMap.get(originalToken.tokenId);
						if (aiData && aiData.senses) {
							return {
								...originalToken,
								...aiData, // Spread AI data (senses, and any other fields it might provide)
								tokenType: TokenType.Word, // Ensure tokenType is Word
								processingState: {
									// Update processing state for successful enrichment
									...originalToken.processingState,
									stage: ProcessingStage.ENRICHED, // Or a more specific SENSES_ENRICHED
									completedAt: Date.now(),
									error: undefined,
								},
								lastUpdated: Date.now(), // Update lastUpdated
							} as WordToken;
						}
						// If AI data is missing for a token or senses are not there, treat as an error for this token
						this.logger.error(
							'AI enrichment did not return valid senses for token in batch',
							{tokenId: originalToken.tokenId},
						);
						return {
							...originalToken,
							processingState: {
								...originalToken.processingState,
								stage: ProcessingStage.ERROR,
								completedAt: Date.now(),
								error: {
									message:
										'AI enrichment failed to provide senses for this token.',
									code: 'AI_SENSE_MISSING',
								},
							},
						} as WordToken;
					});
				} catch (error: any) {
					this.logger.error('Batch enrichment failed in SensesEnrichmentStep', {
						error: error.message,
						batchTokenIds: batch.map(t => t.tokenId),
					});
					// For a batch error, return the original tokens but with their processingState updated
					return batch.map(token => {
						const now = Date.now();
						return {
							...token, // Spread the original token to retain all its fields
							processingState: {
								...token.processingState,
								stage: ProcessingStage.ERROR,
								completedAt: now,
								error: {
									message: `Batch AI enrichment failed: ${error.message}`,
									code: 'BATCH_ENRICHMENT_ERROR',
								},
							},
							// lastUpdated: now, // Optionally update lastUpdated on error, but ensure it's part of WordToken
						} as WordToken; // Ensure it's cast to WordToken, original token fields should satisfy WordToken
					});
				}
			},
			batchSize: 10, // Example batch size
			options: batchConfig,
			onProgress: progress => {
				this.logger.info('Senses enrichment progress', {
					processed: progress.processedItems,
					total: progress.totalItems,
					currentBatch: progress.currentBatch,
					failedBatches: progress.failedBatches,
				});
			},
		});

		// Flatten the array of arrays that batchProcessor might return if it processes in batches.
		// rawEnrichedData is (Partial<WordToken> & {tokenId: string; senses?: ISense[]})[]
		const enrichedOrErroredTokensMap = new Map(
			rawEnrichedData.map(t => [t.tokenId, t]),
		);

		context.tokens.enriched = context.tokens.words.map(originalToken => {
			const enrichmentData = enrichedOrErroredTokensMap.get(
				originalToken.tokenId,
			);
			const now = Date.now();

			if (enrichmentData) {
				// Check if this token was marked with an error during batch processing
				if (enrichmentData.processingState?.stage === ProcessingStage.ERROR) {
					return {
						...originalToken,
						processingState: enrichmentData.processingState,
					} as WordToken; // Still a WordToken, but with error state
				}

				// If senses are present and valid, update the token
				if (enrichmentData.senses && Array.isArray(enrichmentData.senses)) {
					return {
						...originalToken,
						...enrichmentData, // Apply other potentially enriched fields
						tokenType: TokenType.Word, // Ensure tokenType is Word
						senses: enrichmentData.senses.map((sense: any) => ({
							// Cast sense to any for safety, then structure
							...sense, // Spread the AI-returned sense data
							// Ensure required ISense fields are present or defaulted
							senseId:
								sense.senseId ||
								`sense-${sense.partOfSpeech || 'unknown'}-${
									originalToken.normalizedToken
								}-${Date.now()}`,
							tokenId: originalToken.tokenId,
							// partOfSpeech should come from AI
							// translations should come from AI
							// definitions should come from AI
							// examples should come from AI
							// metadata should come from AI
							lastUpdated: now, // Update lastUpdated for the sense
						})) as ISense[],
						processingState: {
							...originalToken.processingState,
							stage: ProcessingStage.ENRICHED, // Mark as enriched
							completedAt: now,
							error: undefined, // Clear any previous error
						},
						lastUpdated: now, // Update lastUpdated for the token
					} as WordToken;
				} else {
					// Senses enrichment data found, but senses are missing or invalid
					this.logger.info(
						// Changed from warn to info
						'Senses enrichment data found but senses are missing/invalid',
						{tokenId: originalToken.tokenId},
					);
					return {
						...originalToken,
						processingState: {
							...originalToken.processingState,
							stage: ProcessingStage.ERROR,
							completedAt: now,
							error: {
								message:
									'Senses enrichment returned invalid or missing senses data.',
								code: 'INVALID_SENSES_DATA',
							},
						},
					} as WordToken;
				}
			}
			// If no enrichment data was found for this token (should not happen if all tokens are processed)
			this.logger.info('No Senses enrichment data found for token', {
				// Changed from warn to info
				tokenId: originalToken.tokenId,
			});
			return {
				...originalToken,
				processingState: {
					...originalToken.processingState,
					stage: ProcessingStage.ERROR,
					completedAt: now,
					error: {
						message: 'Token was not processed by senses enrichment step.',
						code: 'TOKEN_NOT_PROCESSED',
					},
				},
			} as WordToken;
		});

		this.logger.info('Senses enrichment completed', {
			processedTokens: context.tokens.enriched.length,
			firstEnriched: context.tokens.enriched[0]?.content,
			lastEnriched:
				context.tokens.enriched[context.tokens.enriched.length - 1]?.content,
		});

		this.logger.end('process');
		return context;
	}
}
