import {PipelineStep} from '../Pipeline';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {errors} from '../../lib/constants';
import {Logger} from '../../utils/index';
import {ContentType} from '@bocaditosespanol/shared';

interface LanguageInfo {
	main: string;
	variant: string[];
}

interface AddSongRequest {
	interpreter: string;
	title: string;
	youtube: string;
	genre: string[];
	language: LanguageInfo;
	releaseDate: string;
	lyrics: string;
}

export class InputValidatorStep implements PipelineStep<SongProcessingContext> {
	private readonly logger: Logger;

	constructor(private readonly contentType: ContentType) {
		this.logger = new Logger('InputValidatorStep');
	}

	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');

		switch (this.contentType) {
			case ContentType.SONG:
				this.validateSongInput({
					...context.rawInput,
					language: {
						main: context.rawInput.language,
						variant: [],
					},
				});
				break;

			default:
				throw new Error('Unsupported content type');
		}

		context.sentences.raw = [context.rawInput.lyrics];
		this.logger.end('process');
		return context;
	}

	private validateSongInput(input: AddSongRequest): void {
		if (!this.validateRequiredFields(input)) {
			throw new Error(errors.invalidData);
		}

		this.validateDataTypes(input);

		this.logger.info('Input validation completed', {
			title: input.title,
			interpreter: input.interpreter,
			lyricsLength: input.lyrics.length,
		});
	}

	private validateRequiredFields(input: AddSongRequest): boolean {
		return !!(
			input.interpreter &&
			input.title &&
			input.youtube &&
			input.genre &&
			input.language &&
			input.releaseDate &&
			input.lyrics
		);
	}

	private validateDataTypes(input: AddSongRequest): void {
		if (
			typeof input.interpreter !== 'string' ||
			typeof input.title !== 'string' ||
			typeof input.youtube !== 'string' ||
			typeof input.lyrics !== 'string' ||
			typeof input.language !== 'object' ||
			!input.language.main ||
			!Array.isArray(input.language.variant)
		) {
			throw new Error(errors.invalidTextData);
		}

		if (!Array.isArray(input.genre)) {
			throw new Error(errors.invalidData);
		}
	}
}
