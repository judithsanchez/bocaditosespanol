import {Logger} from '@/lib/utils/Logger';

export interface PipelineStep<T> {
	process(input: T): Promise<T>;
}

export interface PipelineOptions {
	name: string;
	stopOnError?: boolean;
}

export class Pipeline<T> {
	private steps: PipelineStep<T>[] = [];
	protected readonly logger: Logger;

	constructor(
		private readonly options: PipelineOptions,
		initialSteps?: PipelineStep<T>[],
	) {
		this.logger = new Logger(`Pipeline:${options.name}`);
		if (initialSteps) {
			this.steps = initialSteps;
		}
	}

	addStep(step: PipelineStep<T>): Pipeline<T> {
		this.steps.push(step);
		return this;
	}

	async process(input: T): Promise<T> {
		this.logger.start('process');
		let currentData = input;

		for (const [index, step] of this.steps.entries()) {
			try {
				this.logger.info(`Executing step ${index + 1}/${this.steps.length}`);
				currentData = await step.process(currentData);
			} catch (error) {
				this.logger.error(`Step ${index + 1} failed`, error);

				if (this.options.stopOnError) {
					throw error;
				}
			}
		}

		this.logger.info('Pipeline completed successfully');
		this.logger.end('process');
		return currentData;
	}

	getStepCount(): number {
		return this.steps.length;
	}

	reset(): void {
		this.steps = [];
		this.logger.info('Pipeline reset');
	}
}
