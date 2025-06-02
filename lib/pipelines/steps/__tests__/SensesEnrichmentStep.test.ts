import {SensesEnrichmentStep} from '../SensesEnrichmentStep';
import {ContentProcessingContext} from '../../ContentProcessingPipeline';
import {ContentType} from '@/lib/types/content';
import {IWord, TokenType} from '@/lib/types/token';
import {ISense} from '@/lib/types/sense';
import {PartOfSpeech} from '@/lib/types/partsOfSpeech';
import {contentEntryDTMFBadBunny} from './fixtures';
import {BatchProcessor} from '../../../utils/BatchProcessor';
import {GenericAIEnricher} from '../../../utils/GenericAIEnricher';
import {TokenAIEnrichmentFactory} from '../../../factories/TokenAIEnrichmentFactory';
import {TokenAIEnrichmentInstructionFactory} from '../../../factories/TokenAIEnrichmentInstructionFactory';
import {AIProviderFactory} from '../../../factories/AIProviderFactory';

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

type SensesAIResponse = Array<
	Pick<IWord, 'tokenId'> & {
		senses?: Omit<ISense, 'senseId' | 'lastUpdated'>[];
	}
>;

describe('SensesEnrichmentStep', () => {
	let enricherStep: SensesEnrichmentStep;
	let mockContext: ContentProcessingContext;
	let mockBatchProcessorProcess: jest.Mock;
	let mockEnricherEnrich: jest.Mock;
	let mockCreateSenseSchema: jest.Mock;
	let mockCreateSensesInstruction: jest.Mock;
	let mockWordsFromFixture: IWord[];

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

		mockCreateSenseSchema = jest
			.fn()
			.mockReturnValue({type: 'object', properties: {}});
		(TokenAIEnrichmentFactory.createSenseSchema as jest.Mock) =
			mockCreateSenseSchema;

		mockCreateSensesInstruction = jest
			.fn()
			.mockReturnValue('Test Senses Instruction');
		(TokenAIEnrichmentInstructionFactory.createSensesInstruction as jest.Mock) =
			mockCreateSensesInstruction;

		enricherStep = new SensesEnrichmentStep();

		mockWordsFromFixture = (contentEntryDTMFBadBunny.processedSentences ?? [])
			.flatMap(s => s?.processedTokens ?? [])
			.filter(t => t?.tokenType === TokenType.Word) as IWord[];

		mockWordsFromFixture = mockWordsFromFixture.map((word, index) => ({
			...word,
			tokenId: word.tokenId || `fixture-word-${index}`,
		}));

		mockContext = {
			input: contentEntryDTMFBadBunny as any,
			contentType: ContentType.SONG,
			sentences: {
				formatted: [],
				deduplicated: [],
				enriched: (contentEntryDTMFBadBunny.processedSentences as any) || [],
			},
			tokens: {
				words: mockWordsFromFixture.slice(0, 2),
				punctuationSigns: [],
				emojis: [],
				deduplicated: [],
				enriched: [],
			},
		};
	});

	it('should enrich tokens with senses', async () => {
		const tokensWithSenses: SensesAIResponse = [
			{
				tokenId: mockContext.tokens.words[0].tokenId,
				senses: [
					{
						tokenId: mockContext.tokens.words[0].tokenId,
						partOfSpeech: PartOfSpeech.Adjective,
						translations: {english: ['other', 'another']},
						grammaticalInfo: {
							type: PartOfSpeech.Adjective,
							gender: '',
							number: '',
						},
						hasSpecialChar: false,
					},
				],
			},
			{
				tokenId: mockContext.tokens.words[1].tokenId,
				senses: [
					{
						tokenId: mockContext.tokens.words[1].tokenId,
						partOfSpeech: PartOfSpeech.Noun,
						translations: {english: ['sunset']},
						grammaticalInfo: {type: PartOfSpeech.Noun, gender: '', number: ''},
						hasSpecialChar: false,
					},
				],
			},
		];

		mockBatchProcessorProcess.mockImplementation(
			async ({processingFn, items}) => {
				mockEnricherEnrich.mockResolvedValue(tokensWithSenses);
				await processingFn(items);
				return tokensWithSenses;
			},
		);

		const fixedTimestamp = 1234567890123;
		jest.spyOn(Date, 'now').mockImplementation(() => fixedTimestamp);

		const resultContext = await enricherStep.process(mockContext);

		expect(mockCreateSenseSchema).toHaveBeenCalledTimes(1);
		expect(mockCreateSensesInstruction).toHaveBeenCalledTimes(1);
		expect(mockBatchProcessorProcess).toHaveBeenCalledTimes(1);
		expect(mockEnricherEnrich).toHaveBeenCalledTimes(1);

		expect(resultContext.tokens.enriched.length).toBe(
			mockContext.tokens.words.length,
		);

		const firstResultToken = resultContext.tokens.enriched[0] as IWord;
		const secondResultToken = resultContext.tokens.enriched[1] as IWord;

		expect(firstResultToken.tokenId).toBe(mockContext.tokens.words[0].tokenId);
		expect(firstResultToken.senses).toBeDefined();
		expect(firstResultToken.senses?.length).toBe(1);
		expect(firstResultToken.senses?.[0].partOfSpeech).toBe(
			PartOfSpeech.Adjective,
		);
		expect(firstResultToken.senses?.[0].translations.english).toEqual([
			'other',
			'another',
		]);
		expect(firstResultToken.senses?.[0].senseId).toBe(
			`sense-${PartOfSpeech.Adjective}-${firstResultToken.content}`,
		);
		expect(firstResultToken.senses?.[0].lastUpdated).toBe(fixedTimestamp);
		expect(firstResultToken.lastUpdated).toBe(fixedTimestamp);
		expect(firstResultToken.content).toBe(mockContext.tokens.words[0].content);

		expect(secondResultToken.tokenId).toBe(mockContext.tokens.words[1].tokenId);
		expect(secondResultToken.senses).toBeDefined();
		expect(secondResultToken.senses?.length).toBe(1);
		expect(secondResultToken.senses?.[0].partOfSpeech).toBe(PartOfSpeech.Noun);
		expect(secondResultToken.senses?.[0].translations.english).toEqual([
			'sunset',
		]);
		expect(secondResultToken.senses?.[0].senseId).toBe(
			`sense-${PartOfSpeech.Noun}-${secondResultToken.content}`,
		);
		expect(secondResultToken.senses?.[0].lastUpdated).toBe(fixedTimestamp);
		expect(secondResultToken.lastUpdated).toBe(fixedTimestamp);

		jest.restoreAllMocks();
	});

	it('should return original token if AI enrichment fails or returns no senses', async () => {
		const tokensWithMissingSenses: SensesAIResponse = [
			{
				tokenId: mockContext.tokens.words[0].tokenId,
			},
			{
				tokenId: mockContext.tokens.words[1].tokenId,
				senses: [
					{
						tokenId: mockContext.tokens.words[1].tokenId,
						partOfSpeech: PartOfSpeech.Noun,
						translations: {english: ['sunset']},
						grammaticalInfo: {type: PartOfSpeech.Noun, gender: '', number: ''},
						hasSpecialChar: false,
					},
				],
			},
		];

		mockBatchProcessorProcess.mockImplementation(
			async ({processingFn, items}) => {
				mockEnricherEnrich.mockResolvedValue(tokensWithMissingSenses);
				await processingFn(items);
				return tokensWithMissingSenses;
			},
		);

		const resultContext = await enricherStep.process(mockContext);

		const firstResultToken = resultContext.tokens.enriched[0] as IWord;
		const secondResultToken = resultContext.tokens.enriched[1] as IWord;

		expect(firstResultToken.senses).toEqual(mockContext.tokens.words[0].senses);
		expect(firstResultToken.lastUpdated).toEqual(
			mockContext.tokens.words[0].lastUpdated,
		);

		expect(secondResultToken.senses).toBeDefined();
		expect(secondResultToken.senses?.length).toBe(1);
		expect(secondResultToken.senses?.[0].partOfSpeech).toBe(PartOfSpeech.Noun);
		expect(secondResultToken.lastUpdated).not.toBe(
			mockContext.tokens.words[1].lastUpdated,
		);
	});

	it('should throw an error if contentType is missing in the context', async () => {
		const contextWithoutType: ContentProcessingContext = {
			...mockContext,
			contentType: undefined,
		};

		await expect(enricherStep.process(contextWithoutType)).rejects.toThrow(
			'ContentType is missing in the processing context. SensesEnrichmentStep cannot proceed.',
		);

		expect(mockBatchProcessorProcess).not.toHaveBeenCalled();
	});
});
