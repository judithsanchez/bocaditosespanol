import {Logger} from './Logger';
import {AIProvider} from '../lib/types';

interface EnricherConfig {
	input: any;
	schema: any;
	instruction: string;
}

export class GenericAIEnricher {
	private logger = new Logger('GenericAIEnricher');

	constructor(private provider: AIProvider) {}

	async enrich({input, schema, instruction}: EnricherConfig): Promise<any> {
		this.logger.start('enrichWithAI');
		this.logger.info('Starting enrichment process', {
			inputType: typeof input,
			provider: this.provider.constructor.name,
		});

		try {
			const enrichedContent = await this.provider.enrichContent(
				input,
				schema,
				instruction,
			);
			this.logger.info('Content enriched successfully');
			this.logger.end('enrichWithAI');
			return enrichedContent;
		} catch (error) {
			this.logger.error('Enrichment failed', error);
			throw error;
		}
	}
}
