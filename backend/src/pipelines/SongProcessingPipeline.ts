import {Pipeline} from './Pipeline';
import {
	ContentType,
	IEmoji,
	IPunctuationSign,
	ISentence,
	ISong,
	IWord,
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
import {AddSongRequest, AIProvider} from 'lib/types';
import {Logger} from '../utils/index';

// TODO: fix emoji recognition
// TODO: fix false cognates because now is detecting incorrect info
export interface SongProcessingContext {
	rawInput: AddSongRequest;
	sentences: {
		raw: string[];
		formatted: ISentence[];
		originalSentencesIds: string[];
		deduplicated: ISentence[];
		enriched: ISentence[];
	};
	tokens: {
		all: Array<IWord | IPunctuationSign | IEmoji>;
		words: IWord[];
		punctuationSigns: IPunctuationSign[];
		emojis: IEmoji[];
		deduplicated: Array<IWord | IPunctuationSign | IEmoji>;
		newTokens: Array<IWord | IPunctuationSign | IEmoji>;
		enriched: Array<IWord | IPunctuationSign | IEmoji>;
	};
	song: ISong;
}
export class SongProcessingPipeline extends Pipeline<SongProcessingContext> {
	private readonly db = new DatabaseService();
	protected readonly logger = new Logger('SongProcessingPipeline');

	constructor(aiProvider: AIProvider) {
		super(
			{
				name: 'SongProcessing',
				stopOnError: true,
			},
			[
				new InputValidatorStep(ContentType.SONG),
				new SentenceFormatterStep(),
				new TokenIdentificationStep(),
				new SentenceAIEnricherSteps(aiProvider),
				new SensesEnrichmentStep(aiProvider),
				new CognateAnalysisStep(aiProvider),
				new SlangDetectionStep(aiProvider),
				new GrammaticalEnricherStep(aiProvider),
			],
		);
	}

	static createContext(input: AddSongRequest): SongProcessingContext {
		return {
			rawInput: input,
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
				newTokens: [],
				enriched: [],
				punctuationSigns: [],
				emojis: [],
			},
			song: {} as ISong,
		};
	}

	async processText(input: AddSongRequest): Promise<SongProcessingContext> {
		this.logger.start('processText');

		const context = SongProcessingPipeline.createContext(input);
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
				language: input.language,
				releaseDate: input.releaseDate,
			},
			lyrics: processedContext.sentences.formatted.map(s => s.sentenceId),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
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
				raw: {
					length: context.sentences.raw.length,
					first: context.sentences.raw[0],
					last: context.sentences.raw[context.sentences.raw.length - 1],
				},
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
				all: context.tokens.all.length,
				words: context.tokens.words.length,
				deduplicated: context.tokens.deduplicated.length,
				newTokens: context.tokens.newTokens.length,
				enriched: context.tokens.enriched.length,
			},
		});
	}
}
