import {CognateAnalysisStep} from '../CognateAnalysisStep';
import {ContentProcessingContext} from '../../ContentProcessingPipeline';
import {ContentType} from '@/lib/types/content';
import {IWord, TokenType, Token} from '@/lib/types/token';
import {contentEntryDTMFBadBunny} from './fixtures';
import {BatchProcessor} from '../../../utils/BatchProcessor';
import {GenericAIEnricher} from '../../../utils/GenericAIEnricher';
import {TokenAIEnrichmentFactory} from '../../../factories/TokenAIEnrichmentFactory';
import {TokenAIEnrichmentInstructionFactory} from '../../../factories/TokenAIEnrichmentInstructionFactory';
import {AIProviderFactory} from '../../../factories/AIProviderFactory';
import {Logger} from '../../../utils/Logger';

jest.mock('../../../utils/BatchProcessor');
jest.mock('../../../utils/GenericAIEnricher');
jest.mock('../../../factories/TokenAIEnrichmentFactory');
jest.mock('../../../factories/TokenAIEnrichmentInstructionFactory');
jest.mock('../../../factories/AIProviderFactory');
jest.mock('../../../utils/Logger');

const mockGetProvider = jest.fn();
(AIProviderFactory.getInstance as jest.Mock).mockReturnValue({
	getProvider: mockGetProvider,
});

type CognateAIResponse = Pick<
	IWord,
	'tokenId' | 'isCognate' | 'isFalseCognate'
>;

describe('CognateAnalysisStep', () => {
	let cognateStep: CognateAnalysisStep;
	let mockContext: ContentProcessingContext;
	let mockBatchProcessorProcess: jest.Mock;
	let mockEnricherEnrich: jest.Mock;
	let mockCreateCognateSchema: jest.Mock;
	let mockCreateCognateInstruction: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();

		mockBatchProcessorProcess = jest.fn();
		(BatchProcessor as jest.Mock).mockImplementation(() => ({
			process: mockBatchProcessorProcess,
		}));

		mockEnricherEnrich = jest.fn();
		(GenericAIEnricher as jest.Mock).mockImplementation(() => ({
			enrich: mockEnricherEnrich,
		}));

		mockCreateCognateSchema = jest
			.fn()
			.mockReturnValue({type: 'object', properties: {}});
		(TokenAIEnrichmentFactory.createCognateSchema as jest.Mock) =
			mockCreateCognateSchema;

		mockCreateCognateInstruction = jest
			.fn()
			.mockReturnValue('Test Cognate Instruction');
		(TokenAIEnrichmentInstructionFactory.createCognateInstruction as jest.Mock) =
			mockCreateCognateInstruction;

		cognateStep = new CognateAnalysisStep();

		const deepClonedFixture = JSON.parse(
			JSON.stringify(contentEntryDTMFBadBunny),
		);
		const allTokens = (deepClonedFixture.processedSentences ?? [])
			.flatMap((s: any) => s?.processedTokens ?? [])
			.filter((t: any) => t !== null && t !== undefined) as Token[];

		const allTokensWithIds = allTokens.map((token, index) => {
			const baseToken = {
				...token,
				tokenId: token.tokenId || `fixture-token-${index}`,
			};
			if (baseToken.tokenType === TokenType.Word) {
				(baseToken as IWord).isCognate = false;
				(baseToken as IWord).isFalseCognate = false;
			}
			return baseToken;
		});

		const wordTokensFromFixture = allTokensWithIds.filter(
			t => t.tokenType === TokenType.Word,
		) as IWord[];
		const otherTokensFromFixture = allTokensWithIds.filter(
			t => t.tokenType !== TokenType.Word,
		);

		const testWordTokens = wordTokensFromFixture.slice(0, 2);
		const testOtherTokens = otherTokensFromFixture.slice(0, 1);

		mockContext = {
			input: deepClonedFixture as any,
			contentType: ContentType.SONG,
			sentences: {
				formatted: [],
				deduplicated: [],
				enriched: (deepClonedFixture.processedSentences as any) || [],
			},
			tokens: {
				words: [],
				punctuationSigns: [],
				emojis: [],
				deduplicated: [],
				enriched: [...testWordTokens, ...testOtherTokens],
			},
		};
	});

	it('should enrich word tokens with cognate analysis', async () => {
		const wordToken1 = mockContext.tokens.enriched[0] as IWord;
		const wordToken2 = mockContext.tokens.enriched[1] as IWord;
		const originalOtherToken = mockContext.tokens.enriched[2];

		const aiResponse: CognateAIResponse[] = [
			{tokenId: wordToken1.tokenId, isCognate: true, isFalseCognate: false},
			{tokenId: wordToken2.tokenId, isCognate: false, isFalseCognate: true},
		];

		mockBatchProcessorProcess.mockImplementation(
			async ({items, processingFn}) => {
				mockEnricherEnrich.mockResolvedValue(aiResponse);
				const resultFromProcessingFn = await processingFn(items);
				return resultFromProcessingFn;
			},
		);

		const fixedTimestamp = 1234567890123;
		jest.spyOn(Date, 'now').mockImplementation(() => fixedTimestamp);

		const resultContext = await cognateStep.process(mockContext);

		expect(mockCreateCognateSchema).toHaveBeenCalledTimes(1);
		expect(mockCreateCognateInstruction).toHaveBeenCalledTimes(1);
		expect(mockBatchProcessorProcess).toHaveBeenCalledTimes(1);
		expect(mockEnricherEnrich).toHaveBeenCalledTimes(1);

		expect(resultContext.tokens.enriched.length).toBe(
			mockContext.tokens.enriched.length,
		);

		const firstResultToken = resultContext.tokens.enriched.find(
			t => t.tokenId === wordToken1.tokenId,
		) as IWord;
		const secondResultToken = resultContext.tokens.enriched.find(
			t => t.tokenId === wordToken2.tokenId,
		) as IWord;
		const otherTokenResult = resultContext.tokens.enriched.find(
			t => t.tokenId === originalOtherToken.tokenId,
		);

		expect(firstResultToken).toBeDefined();
		expect(firstResultToken.isCognate).toBe(true);
		expect(firstResultToken.isFalseCognate).toBe(false);
		expect(firstResultToken.lastUpdated).toBe(fixedTimestamp);

		expect(secondResultToken).toBeDefined();
		expect(secondResultToken.isCognate).toBe(false);
		expect(secondResultToken.isFalseCognate).toBe(true);
		expect(secondResultToken.lastUpdated).toBe(fixedTimestamp);

		expect(otherTokenResult).toBeDefined();
		expect(otherTokenResult).not.toHaveProperty('isCognate');
		expect(otherTokenResult).not.toHaveProperty('isFalseCognate');
		expect(otherTokenResult).toEqual(originalOtherToken);

		jest.restoreAllMocks();
	});

	it('should not update timestamp if cognate data is unchanged', async () => {
		const wordToken1 = mockContext.tokens.enriched[0] as IWord;
		const wordToken2 = mockContext.tokens.enriched[1] as IWord;

		wordToken1.isCognate = true;
		wordToken1.isFalseCognate = false;
		wordToken1.lastUpdated = 1000;

		const aiResponse: CognateAIResponse[] = [
			{tokenId: wordToken1.tokenId, isCognate: true, isFalseCognate: false},
			{tokenId: wordToken2.tokenId, isCognate: true, isFalseCognate: false},
		];

		mockBatchProcessorProcess.mockImplementation(
			async ({items, processingFn}) => {
				mockEnricherEnrich.mockResolvedValue(aiResponse);
				return await processingFn(items);
			},
		);

		const fixedTimestamp = 1234567890123;
		jest.spyOn(Date, 'now').mockImplementation(() => fixedTimestamp);

		const resultContext = await cognateStep.process(mockContext);

		const firstResultToken = resultContext.tokens.enriched.find(
			t => t.tokenId === wordToken1.tokenId,
		) as IWord;
		const secondResultToken = resultContext.tokens.enriched.find(
			t => t.tokenId === wordToken2.tokenId,
		) as IWord;

		expect(firstResultToken.lastUpdated).toBe(1000);
		expect(firstResultToken.isCognate).toBe(true);
		expect(firstResultToken.isFalseCognate).toBe(false);

		expect(secondResultToken.lastUpdated).toBe(fixedTimestamp);
		expect(secondResultToken.isCognate).toBe(true);
		expect(secondResultToken.isFalseCognate).toBe(false);

		jest.restoreAllMocks();
	});

	it('should handle AI response missing data for a token', async () => {
		const wordToken1 = mockContext.tokens.enriched[0] as IWord;
		const wordToken2 = mockContext.tokens.enriched[1] as IWord;

		const originalTimestampWord1 = 1000;
		const originalTimestampWord2 = 2000;
		wordToken1.lastUpdated = originalTimestampWord1;
		wordToken2.lastUpdated = originalTimestampWord2;

		const aiResponse: CognateAIResponse[] = [
			{tokenId: wordToken1.tokenId, isCognate: true, isFalseCognate: false},
		];

		mockBatchProcessorProcess.mockImplementation(
			async ({items, processingFn}) => {
				mockEnricherEnrich.mockResolvedValue(aiResponse);
				return await processingFn(items);
			},
		);

		const fixedTimestamp = 1234567890123;
		jest.spyOn(Date, 'now').mockImplementation(() => fixedTimestamp);

		const resultContext = await cognateStep.process(mockContext);

		const firstResultToken = resultContext.tokens.enriched.find(
			t => t.tokenId === wordToken1.tokenId,
		) as IWord;
		const secondResultToken = resultContext.tokens.enriched.find(
			t => t.tokenId === wordToken2.tokenId,
		) as IWord;

		expect(firstResultToken.isCognate).toBe(true);
		expect(firstResultToken.isFalseCognate).toBe(false);
		expect(firstResultToken.lastUpdated).toBe(fixedTimestamp);

		expect(secondResultToken.isCognate).toBe(false);
		expect(secondResultToken.isFalseCognate).toBe(false);
		expect(secondResultToken.lastUpdated).toBe(originalTimestampWord2);

		jest.restoreAllMocks();
	});

	it('should handle empty word tokens list', async () => {
		const deepClonedFixture = JSON.parse(
			JSON.stringify(contentEntryDTMFBadBunny),
		);
		const allTokens = (deepClonedFixture.processedSentences ?? [])
			.flatMap((s: any) => s?.processedTokens ?? [])
			.filter((t: any) => t !== null && t !== undefined) as Token[];
		const allTokensWithIds = allTokens.map((token, index) => ({
			...token,
			tokenId: token.tokenId || `fixture-token-${index}`,
		}));
		const otherTokensOnly = allTokensWithIds.filter(
			t => t.tokenType !== TokenType.Word,
		);

		mockContext.tokens.enriched = otherTokensOnly.slice(0, 1);

		const resultContext = await cognateStep.process(mockContext);

		expect(mockBatchProcessorProcess).not.toHaveBeenCalled();
		expect(mockEnricherEnrich).not.toHaveBeenCalled();
		expect(resultContext).toBe(mockContext);
	});

	it('should throw an error if contentType is missing', async () => {
		const contextWithoutType: ContentProcessingContext = {
			...mockContext,
			contentType: undefined,
		};

		await expect(cognateStep.process(contextWithoutType)).rejects.toThrow(
			'ContentType is missing in the processing context. CognateAnalysisStep cannot proceed.',
		);

		expect(mockBatchProcessorProcess).not.toHaveBeenCalled();
	});
});
