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
		deduplicated: Array<IWord | IPunctuationSign | IEmoji>;
		newTokens: Array<IWord | IPunctuationSign | IEmoji>;
		enriched: Array<IWord | IPunctuationSign | IEmoji>;
	};
	song: ISong;
}
export class SongProcessingPipeline extends Pipeline<SongProcessingContext> {
	private readonly db = new DatabaseService();

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
			},
			song: {} as ISong,
		};
	}

	async processText(input: AddSongRequest): Promise<SongProcessingContext> {
		const context = SongProcessingPipeline.createContext(input);
		const processedContext = await this.process(context);

		processedContext.song = {
			songId: `${input.title
				.toLowerCase()
				.replace(/\s+/g, '-')}-${input.interpreter
				.toLowerCase()
				.replace(/\s+/g, '-')}`,
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

		await this.db.saveSentences(processedContext.sentences.enriched, {
			title: input.title,
			interpreter: input.interpreter,
		});
		await this.db.saveTextEntry(processedContext.song, 'song');
		await this.db.saveTokens(processedContext.tokens.enriched);

		return processedContext;
	}
}
