import {SentenceAIEnricherSteps} from '../SentenceAIEnricherSteps';
import {ContentProcessingContext} from '../../ContentProcessingPipeline';
import {ContentType} from '@/lib/types/content';
import {ISentence} from '@/lib/types/sentence';
import {contentEntryDTMFBadBunny} from './fixtures';
import {BatchProcessor} from '../../../utils/BatchProcessor';
import {GenericAIEnricher} from '../../../utils/GenericAIEnricher';
import {ContentSchemaFactory} from '../../../factories/ContentSchemaFactory';
import {ContentInstructionFactory} from '../../../factories/ContentInstructionsFactory';
import {AIProviderFactory} from '../../../factories/AIProviderFactory';
import {Logger} from '../../../utils/Logger';

jest.mock('../../../utils/BatchProcessor');
jest.mock('../../../utils/GenericAIEnricher');
jest.mock('../../../factories/ContentSchemaFactory');
jest.mock('../../../factories/ContentInstructionsFactory');
jest.mock('../../../factories/AIProviderFactory');
jest.mock('../../../utils/Logger');

const mockGetProvider = jest.fn();
(AIProviderFactory.getInstance as jest.Mock).mockReturnValue({
	getProvider: mockGetProvider,
});

describe('SentenceAIEnricherSteps', () => {
	let enricherSteps: SentenceAIEnricherSteps;
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
		(ContentSchemaFactory.createSchema as jest.Mock) = mockCreateSchema;

		mockCreateInstruction = jest.fn().mockReturnValue('Test Instruction');
		(ContentInstructionFactory.createInstruction as jest.Mock) =
			mockCreateInstruction;

		enricherSteps = new SentenceAIEnricherSteps();

		const deduplicatedSentences =
			contentEntryDTMFBadBunny.processedSentences!.slice(0, 2) as ISentence[];
		mockContext = {
			input: contentEntryDTMFBadBunny as any,
			contentType: ContentType.SONG,
			sentences: {
				formatted: [],
				deduplicated: deduplicatedSentences,
				enriched: [],
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

	it('should process sentences and enrich them using the context contentType', async () => {
		const mockEnrichedSentences: ISentence[] = [
			{
				...mockContext.sentences.deduplicated[0],
				translations: {
					english: {contextual: 'Enriched 1', literal: 'Enriched Lit 1'},
				},
			},
			{
				...mockContext.sentences.deduplicated[1],
				translations: {
					english: {contextual: 'Enriched 2', literal: 'Enriched Lit 2'},
				},
			},
		];

		mockBatchProcessorProcess.mockImplementation(
			async ({processingFn, items}) => {
				mockEnricherEnrich.mockResolvedValue(mockEnrichedSentences);
				await processingFn(items);
				return mockEnrichedSentences;
			},
		);

		const resultContext = await enricherSteps.process(mockContext);

		expect(mockCreateSchema).toHaveBeenCalledWith(ContentType.SONG);
		expect(mockCreateInstruction).toHaveBeenCalledWith(ContentType.SONG);

		expect(mockBatchProcessorProcess).toHaveBeenCalledTimes(1);
		expect(mockBatchProcessorProcess).toHaveBeenCalledWith(
			expect.objectContaining({
				items: mockContext.sentences.deduplicated,
				batchSize: expect.any(Number),
				options: expect.any(Object),
				onProgress: expect.any(Function),
				processingFn: expect.any(Function),
			}),
		);

		expect(resultContext.sentences.enriched).toEqual(mockEnrichedSentences);
		expect(resultContext.sentences.enriched.length).toBe(2);
		expect(
			resultContext.sentences.enriched[0].translations?.english?.contextual,
		).toBe('Enriched 1');
	});

	it('should throw an error if contentType is missing in the context', async () => {
		const contextWithoutType: ContentProcessingContext = {
			...mockContext,
			contentType: undefined,
		};

		await expect(enricherSteps.process(contextWithoutType)).rejects.toThrow(
			'ContentType is missing in the processing context. SentenceAIEnricherSteps cannot proceed.',
		);

		expect(mockCreateSchema).not.toHaveBeenCalled();
		expect(mockCreateInstruction).not.toHaveBeenCalled();
		expect(mockBatchProcessorProcess).not.toHaveBeenCalled();
	});
});
