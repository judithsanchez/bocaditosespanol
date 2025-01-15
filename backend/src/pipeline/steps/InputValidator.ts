import {PipelineStep} from '../Pipeline';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {errors} from '../../lib/constants';
import {Logger} from '../../utils/Logger';
import {ContentType} from '../types/PipelineTypes';
import {AddSongRequest} from '../../../../lib/types';

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
				this.validateSongInput(context.rawInput);
				break;
			case ContentType.TRANSCRIPT:
				this.validateTranscriptInput(context.rawInput);
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
			typeof input.language !== 'string' ||
			typeof input.lyrics !== 'string'
		) {
			throw new Error(errors.invalidTextData);
		}

		if (!Array.isArray(input.genre)) {
			throw new Error(errors.invalidData);
		}

		const youtubeUrlPattern =
			/^https:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/;
		if (!youtubeUrlPattern.test(input.youtube)) {
			throw new Error('Invalid YouTube URL format');
		}
	}

	private validateTranscriptInput(input: any): void {
		if (
			!input.title ||
			!input.videoId ||
			!input.language ||
			!input.transcript
		) {
			throw new Error(errors.invalidData);
		}

		if (
			typeof input.title !== 'string' ||
			typeof input.videoId !== 'string' ||
			typeof input.language !== 'string' ||
			typeof input.transcript !== 'string'
		) {
			throw new Error(errors.invalidTextData);
		}

		this.logger.info('Transcript validation completed', {
			title: input.title,
			videoId: input.videoId,
			transcriptLength: input.transcript.length,
		});
	}
}
