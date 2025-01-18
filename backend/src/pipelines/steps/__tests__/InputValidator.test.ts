import {InputValidatorStep} from '../InputValidator';
import {ContentType} from '../../types/PipelineTypes';
import {SongProcessingContext} from '../../SongProcessingPipeline';
import {errors} from '../../../lib/constants';
import {inputValidatorFixtures} from '../../../lib/fixtures';

describe('InputValidatorStep', () => {
	let validator: InputValidatorStep;
	let validContext: SongProcessingContext;

	beforeEach(() => {
		validator = new InputValidatorStep(ContentType.SONG);
		validContext = {
			rawInput: inputValidatorFixtures.validSongInput,
			sentences: {
				raw: [],
				formatted: [],
				originalSentencesIds: [],
				deduplicated: [],
				enriched: [],
			},
			tokens: {
				all: [],
				words: [],
				deduplicated: [],
				enriched: [],
			},
			song: {} as any,
		};
	});

	describe('process', () => {
		it('should process valid input successfully', async () => {
			const result = await validator.process(validContext);
			expect(result.sentences.raw).toEqual([validContext.rawInput.lyrics]);
		});

		it('should throw error for unsupported content type', async () => {
			const invalidValidator = new InputValidatorStep('INVALID' as ContentType);
			await expect(invalidValidator.process(validContext)).rejects.toThrow(
				'Unsupported content type',
			);
		});
	});

	describe('input validation', () => {
		it('should throw error when required fields are missing', async () => {
			const invalidContext = {
				...validContext,
				rawInput: inputValidatorFixtures.invalidInputs.emptyInterpreter,
			};
			await expect(validator.process(invalidContext)).rejects.toThrow(
				errors.invalidData,
			);
		});

		it('should throw error for invalid youtube URL format', async () => {
			const invalidContext = {
				...validContext,
				rawInput: {
					...validContext.rawInput,
					youtube: 'invalid-url',
				},
			};
			await expect(validator.process(invalidContext)).rejects.toThrow(
				'Invalid youtube URL format',
			);
		});

		it('should throw error for invalid genre format', async () => {
			const invalidContext = {
				...validContext,
				rawInput: {
					...validContext.rawInput,
					genre: 'pop' as any,
				},
			};
			await expect(validator.process(invalidContext)).rejects.toThrow(
				errors.invalidData,
			);
		});

		it('should throw error for invalid data types', async () => {
			const invalidContext = {
				...validContext,
				rawInput: {
					...validContext.rawInput,
					interpreter: 123 as any,
				},
			};
			await expect(validator.process(invalidContext)).rejects.toThrow(
				errors.invalidTextData,
			);
		});
	});

	describe('edge cases', () => {
		it('should reject empty lyrics as invalid data', async () => {
			const contextWithEmptyLyrics = {
				...validContext,
				rawInput: {
					...validContext.rawInput,
					lyrics: '',
				},
			};
			await expect(validator.process(contextWithEmptyLyrics)).rejects.toThrow(
				errors.invalidData,
			);
		});

		it('should accept valid youtube URLs with different formats', async () => {
			const validyoutubeUrls = [
				'https://youtube.com/watch?v=dQw4w9WgXcQ',
				'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
			];

			for (const url of validyoutubeUrls) {
				const context = {
					...validContext,
					rawInput: {
						...validContext.rawInput,
						youtube: url,
					},
				};
				const result = await validator.process(context);
				expect(result.sentences.raw).toEqual([context.rawInput.lyrics]);
			}
		});
	});
});
