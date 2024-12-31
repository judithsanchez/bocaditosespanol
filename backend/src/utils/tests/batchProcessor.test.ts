import {errors, logs} from 'lib/constants';
import {batchProcessor} from '../batchProcessor';
import {batchProcessorFixtures} from './lib/fixtures';

describe('batchProcessor', () => {
	const consoleSpy = {
		log: jest.spyOn(console, 'log').mockImplementation(),
		error: jest.spyOn(console, 'error').mockImplementation(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('processes items in correct batch sizes', async () => {
		const {input, expected} = batchProcessorFixtures.simpleItems;
		const {batchSize, options} = batchProcessorFixtures.defaultConfig;

		const mockProcessingFn = jest
			.fn()
			.mockImplementation(items =>
				Promise.resolve(
					items.map((item: string) => item.replace('item', 'processed')),
				),
			);

		const result = await batchProcessor({
			items: input,
			processingFn: mockProcessingFn,
			batchSize,
			options,
		});

		expect(result).toEqual(expected);
		expect(mockProcessingFn).toHaveBeenCalledTimes(3);
	});

	test('handles empty input array', async () => {
		const {input, expected} = batchProcessorFixtures.emptyItems;
		const {batchSize, options} = batchProcessorFixtures.defaultConfig;

		const mockProcessingFn = jest.fn().mockResolvedValue([]);

		const result = await batchProcessor({
			items: input,
			processingFn: mockProcessingFn,
			batchSize,
			options,
		});

		expect(result).toEqual(expected);
		expect(mockProcessingFn).not.toHaveBeenCalled();
	});

	test('retries failed batch processing', async () => {
		const {input} = batchProcessorFixtures.simpleItems;
		const {batchSize, options} = batchProcessorFixtures.defaultConfig;

		const mockProcessingFn = jest
			.fn()
			.mockRejectedValueOnce(new Error('Processing failed'))
			.mockResolvedValueOnce(['processed1', 'processed2']);

		await batchProcessor({
			items: input.slice(0, 2),
			processingFn: mockProcessingFn,
			batchSize,
			options,
		});

		expect(mockProcessingFn).toHaveBeenCalledTimes(2);
		expect(consoleSpy.error).toHaveBeenCalledWith(
			expect.stringContaining(logs.batchProcessing.batchFailed),
			expect.any(Error),
		);
	});

	test('throws error after max retry attempts', async () => {
		const {input} = batchProcessorFixtures.simpleItems;
		const {batchSize, options} = batchProcessorFixtures.defaultConfig;

		const mockProcessingFn = jest
			.fn()
			.mockRejectedValue(new Error('Processing failed'));

		await expect(
			batchProcessor({
				items: input.slice(0, 2),
				processingFn: mockProcessingFn,
				batchSize,
				options,
			}),
		).rejects.toThrow(errors.batchProcessingFailed);

		expect(mockProcessingFn).toHaveBeenCalledTimes(options.retryAttempts);
	});
});
