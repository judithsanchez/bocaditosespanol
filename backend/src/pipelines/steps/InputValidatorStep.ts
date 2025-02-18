import {PipelineStep} from '../Pipeline';
import {SongProcessingContext} from '../SongProcessingPipeline';
import {Logger} from '../../utils/index';
import {ContentType, songRequestSchema} from '@bocaditosespanol/shared';

export class InputValidatorStep implements PipelineStep<SongProcessingContext> {
	private readonly logger: Logger;

	constructor(private readonly contentType: ContentType) {
		this.logger = new Logger('InputValidatorStep');
	}

	async process(
		context: SongProcessingContext,
	): Promise<SongProcessingContext> {
		this.logger.start('process');

		this.logInputDetails(context);
		await this.validateContentType(context);

		this.logger.info('Validation completed successfully');
		this.logger.end('process');
		return context;
	}

	private logInputDetails(context: SongProcessingContext): void {
		this.logger.info('Processing input', {
			interpreter: context.rawInput.interpreter,
			title: context.rawInput.title,
		});
	}

	private async validateContentType(
		context: SongProcessingContext,
	): Promise<void> {
		switch (this.contentType) {
			case ContentType.SONG:
				await this.validateSongInput(context);
				break;
			default:
				throw new Error(`Unsupported content type: ${this.contentType}`);
		}
	}

	private async validateSongInput(
		context: SongProcessingContext,
	): Promise<void> {
		const result = songRequestSchema.safeParse(context.rawInput);

		if (!result.success) {
			throw new Error(this.formatValidationError(result.error.format()));
		}
	}

	private formatValidationError(error: unknown): string {
		return `Validation failed: ${JSON.stringify(error)}`;
	}
}
