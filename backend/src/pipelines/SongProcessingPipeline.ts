import {Pipeline} from './Pipeline';
import {
	ContentType,
	IEmoji,
	IPunctuationSign,
	ISentence,
	ISong,
	IWord,
	songRequestSchema,
	AddSongRequest,
	Token,
} from '@bocaditosespanol/shared';
import {DatabaseService} from '../services/DatabaseService';
import {
	InputValidatorStep,
	SentenceFormatterStep,
	SentenceAIEnricherSteps,
	TokenIdentificationStep,
	GrammaticalEnricherStep,
	SensesEnrichmentStep,
	CognateAnalysisStep,
	SlangDetectionStep,
} from './steps/index';
import {Logger} from '../utils/index';

// TODO: fix emoji recognition
export interface SongProcessingContext {
	rawInput: AddSongRequest;
	sentences: {
		formatted: ISentence[];
		deduplicated: ISentence[];
		enriched: ISentence[];
	};
	tokens: {
		words: IWord[];
		punctuationSigns: IPunctuationSign[];
		emojis: IEmoji[];
		deduplicated: Token[];
		enriched: Token[];
	};
	song: ISong;
}
export class SongProcessingPipeline extends Pipeline<SongProcessingContext> {
	private readonly db: DatabaseService;
	protected readonly logger: Logger;

	constructor() {
		const db = new DatabaseService();

		super(
			{
				name: 'SongProcessing',
				stopOnError: true,
			},
			[
				new InputValidatorStep(ContentType.SONG),
				new SentenceFormatterStep(),
				new TokenIdentificationStep(db),
				new SentenceAIEnricherSteps(),
				new SensesEnrichmentStep(),
				new CognateAnalysisStep(),
				new SlangDetectionStep(),
				new GrammaticalEnricherStep(),
			],
		);
		this.db = new DatabaseService();
		this.logger = new Logger('SongProcessingPipeline');
	}
	static createContext(input: AddSongRequest): SongProcessingContext {
		return {
			rawInput: input,
			sentences: {
				formatted: [],
				deduplicated: [],
				enriched: [],
			},
			tokens: {
				words: [],
				deduplicated: [],
				enriched: [],
				punctuationSigns: [],
				emojis: [],
			},
			song: {} as ISong,
		};
	}

	async processText(input: AddSongRequest): Promise<SongProcessingContext> {
		this.logger.start('processText');

		const validationResult = songRequestSchema.safeParse(input);
		if (!validationResult.success) {
			throw new Error(`Invalid song data: ${validationResult.error.message}`);
		}

		const context = SongProcessingPipeline.createContext(validationResult.data);
		this.logger.info('Context created', {
			interpreter: input.interpreter,
			title: input.title,
		});

		const processedContext = await this.process(context);
		this.logContextState('After pipeline processing', processedContext);

		processedContext.song = {
			songId: `${input.title.toLowerCase().replace(/\s+/g, '-')}-${input.interpreter.toLowerCase().replace(/\s+/g, '-')}`,
			metadata: {
				interpreter: input.interpreter,
				feat: input.feat,
				title: input.title,
				youtube: input.youtube,
				genre: input.genre,
				language: input.language.main,
				releaseDate: input.releaseDate,
			},
			lyrics: processedContext.sentences.formatted.map(s => s.sentenceId),
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};

		this.logger.info('Saving to database');
		await this.db.saveSentences(processedContext.sentences.enriched, {
			title: input.title,
			interpreter: input.interpreter,
		});
		await this.db.saveTextEntry(processedContext.song, 'song');
		await this.db.saveTokens([
			...processedContext.tokens.enriched,
			...processedContext.tokens.punctuationSigns,
			...processedContext.tokens.emojis,
		]);

		this.logger.info('Database operations completed');
		this.logger.end('processText');
		return processedContext;
	}
	private logContextState(stepName: string, context: SongProcessingContext) {
		this.logger.info(`${stepName} - Context State`, {
			sentences: {
				formatted: {
					length: context.sentences.formatted.length,
					first: context.sentences.formatted[0],
					last: context.sentences.formatted[
						context.sentences.formatted.length - 1
					],
				},
				deduplicated: {
					length: context.sentences.deduplicated.length,
				},
				enriched: {
					length: context.sentences.enriched.length,
				},
			},
			tokens: {
				words: context.tokens.words.length,
				deduplicated: context.tokens.deduplicated.length,
				enriched: context.tokens.enriched.length,
			},
		});
	}
}
