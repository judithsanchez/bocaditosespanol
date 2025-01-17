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

		it('should throw error for invalid spotify URL format', async () => {
			const invalidContext = {
				...validContext,
				rawInput: {
					...validContext.rawInput,
					spotify: 'invalid-url',
				},
			};
			await expect(validator.process(invalidContext)).rejects.toThrow(
				'Invalid spotify URL format',
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

		it('should accept valid spotify URLs with different formats', async () => {
			const validspotifyUrls = [
				'https://spotify.com/watch?v=dQw4w9WgXcQ',
				'https://www.spotify.com/watch?v=dQw4w9WgXcQ',
			];

			for (const url of validspotifyUrls) {
				const context = {
					...validContext,
					rawInput: {
						...validContext.rawInput,
						spotify: url,
					},
				};
				const result = await validator.process(context);
				expect(result.sentences.raw).toEqual([context.rawInput.lyrics]);
			}
		});
	});
});
