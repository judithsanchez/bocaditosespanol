import {SentenceLearningInsightsEnricherStep} from '../SentenceLearningInsightsEnricherStep';
import {ContentProcessingContext} from '../../ContentProcessingPipeline';
import {ContentType} from '@/lib/types/content';
import {ISentence, Difficulty, ILearningInsight} from '@/lib/types/sentence';
import {contentEntryDTMFBadBunny} from './fixtures';
import {BatchProcessor} from '../../../utils/BatchProcessor';
import {GenericAIEnricher} from '../../../utils/GenericAIEnricher';
import {SentencesSchemaFactory} from '../../../factories/SentencesSchemaFactory';
import {SentencesInstructionsFactory} from '../../../factories/SentencesInstructionsFactory';
import {AIProviderFactory} from '../../../factories/AIProviderFactory';

jest.mock('../../../utils/BatchProcessor');
jest.mock('../../../utils/GenericAIEnricher');
jest.mock('../../../factories/SentencesSchemaFactory');
jest.mock('../../../factories/SentencesInstructionsFactory');
jest.mock('../../../factories/AIProviderFactory');
jest.mock('../../../utils/Logger');

const mockGetProvider = jest.fn();
(AIProviderFactory.getInstance as jest.Mock).mockReturnValue({
	getProvider: mockGetProvider,
});

describe('SentenceLearningInsightsEnricherStep', () => {
	let enricherStep: SentenceLearningInsightsEnricherStep;
	let mockContext: ContentProcessingContext;
	let mockBatchProcessorProcess: jest.Mock;
	let mockEnricherEnrich: jest.Mock;
	let mockCreateSchema: jest.Mock;
	let mockCreateInstruction: jest.Mock;

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

		mockCreateSchema = jest
			.fn()
			.mockReturnValue({type: 'object', properties: {}});
		(SentencesSchemaFactory.createSchema as jest.Mock) = mockCreateSchema;

		mockCreateInstruction = jest
			.fn()
			.mockReturnValue('Test Learning Instruction');
		(SentencesInstructionsFactory.createInstruction as jest.Mock) =
			mockCreateInstruction;

		enricherStep = new SentenceLearningInsightsEnricherStep();

		const enrichedSentencesFixture =
			contentEntryDTMFBadBunny.processedSentences!.map(s => ({
				...s,
				translations: s.translations || {
					english: {contextual: 'Context', literal: 'Literal'},
				},
			})) as ISentence[];

		mockContext = {
			input: contentEntryDTMFBadBunny as any,
			contentType: ContentType.SONG,
			sentences: {
				formatted: [],
				deduplicated: [],
				enriched: enrichedSentencesFixture,
			},
			tokens: {
				words: [],
				punctuationSigns: [],
				emojis: [],
				deduplicated: [],
				enriched: [],
			},
		};
	});

	it('should enrich sentences with learning insights using the context contentType', async () => {
		type LearningInsightAIResponse = Array<
			Pick<ISentence, 'sentenceId'> & {
				learningInsights?: ILearningInsight;
			}
		>;

		const sentencesWithInsights: LearningInsightAIResponse = [
			{
				sentenceId: mockContext.sentences.enriched[0].sentenceId,
				learningInsights: {
					insight: 'Insight 1',
					difficulty: Difficulty.BEGINNER,
				},
			},
			{
				sentenceId: mockContext.sentences.enriched[1].sentenceId,
				learningInsights: {
					insight: 'Insight 2',
					difficulty: Difficulty.INTERMEDIATE,
				},
			},
		];

		mockBatchProcessorProcess.mockImplementation(
			async ({processingFn, items}) => {
				mockEnricherEnrich.mockResolvedValue(sentencesWithInsights);
				await processingFn(items);
				return sentencesWithInsights;
			},
		);

		const resultContext = await enricherStep.process(mockContext);

		expect(mockCreateSchema).toHaveBeenCalledWith(ContentType.SONG);
		expect(mockCreateInstruction).toHaveBeenCalledWith(ContentType.SONG);
		expect(mockBatchProcessorProcess).toHaveBeenCalledTimes(1);

		expect(resultContext.sentences.enriched.length).toBe(
			mockContext.sentences.enriched.length,
		);

		const firstResultSentence = resultContext.sentences.enriched.find(
			s => s.sentenceId === sentencesWithInsights[0].sentenceId,
		);
		const secondResultSentence = resultContext.sentences.enriched.find(
			s => s.sentenceId === sentencesWithInsights[1].sentenceId,
		);

		expect(firstResultSentence?.learningInsights?.insight).toBe('Insight 1');
		expect(firstResultSentence?.learningInsights?.difficulty).toBe(
			Difficulty.BEGINNER,
		);
		expect(secondResultSentence?.learningInsights?.insight).toBe('Insight 2');
		expect(secondResultSentence?.learningInsights?.difficulty).toBe(
			Difficulty.INTERMEDIATE,
		);

		expect(firstResultSentence?.content).toBe(
			mockContext.sentences.enriched[0].content,
		);
		expect(firstResultSentence?.translations).toEqual(
			mockContext.sentences.enriched[0].translations,
		);
		expect(secondResultSentence?.content).toBe(
			mockContext.sentences.enriched[1].content,
		);
		expect(secondResultSentence?.translations).toEqual(
			mockContext.sentences.enriched[1].translations,
		);
	});

	it('should throw an error if contentType is missing in the context', async () => {
		const contextWithoutType: ContentProcessingContext = {
			...mockContext,
			contentType: undefined,
		};

		await expect(enricherStep.process(contextWithoutType)).rejects.toThrow(
			'ContentType is missing in the processing context. SentenceLearningInsightsEnricherStep cannot proceed.',
		);

		expect(mockCreateSchema).not.toHaveBeenCalled();
		expect(mockCreateInstruction).not.toHaveBeenCalled();
		expect(mockBatchProcessorProcess).not.toHaveBeenCalled();
	});
});
