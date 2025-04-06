import {TokenIdentificationStep} from '../TokenIdentificationStep';
import {
	createBadBunnySongContextWithFormattedSentences,
	createSimpleSentencesContext,
	createBadBunnySongContext,
} from './fixtures';
import {WriteDatabaseService} from '@/lib/services/WriteDatabaseService';

jest.mock('@/lib/services/WriteDatabaseService');

describe('TokenIdentificationStep', () => {
	let step: TokenIdentificationStep;
	let mockDb: jest.Mocked<WriteDatabaseService>;

	beforeEach(() => {
		jest.clearAllMocks();

		mockDb = new WriteDatabaseService() as jest.Mocked<WriteDatabaseService>;

		mockDb.filterExistingTokens = jest.fn().mockImplementation(async tokens => {
			return {
				existingTokens: [],
				newTokens: tokens,
			};
		});

		step = new TokenIdentificationStep(mockDb);
	});

	it('should process sentences and identify tokens in a happy path scenario', async () => {
		const context = createBadBunnySongContextWithFormattedSentences();

		const result = await step.process(context);

		expect(result.sentences.formatted.length).toBe(3);
		expect(result.sentences.formatted[0].tokenIds.length).toBeGreaterThan(0);
		expect(result.sentences.formatted[1].tokenIds.length).toBeGreaterThan(0);
	});

	it('should handle empty sentences gracefully', async () => {
		const context = createBadBunnySongContext();

		const result = await step.process(context);

		expect(result.sentences.formatted).toEqual([]);
	});

	it('should handle existing tokens in the database', async () => {
		const context = createSimpleSentencesContext();

		mockDb.filterExistingTokens = jest.fn().mockImplementation(async tokens => {
			const existingTokens = tokens.filter(
				(t: {tokenId: string}) => t.tokenId === 'word-hola',
			);
			const newTokens = tokens.filter(
				(t: {tokenId: string}) => t.tokenId !== 'word-hola',
			);
			return {existingTokens, newTokens};
		});

		const result = await step.process(context);

		expect(result.tokens.words.some(w => w.content === 'hola')).toBeFalsy();
		expect(result.tokens.words.some(w => w.content === 'mundo')).toBeTruthy();
	});
});
