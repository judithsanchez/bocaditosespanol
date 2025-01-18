import {Pipeline} from './Pipeline';
import {ContentType} from './types/PipelineTypes';
import {
	AddSongRequest,
	IEmoji,
	IPunctuationSign,
	ISentence,
	ISong,
	IWord,
} from 'lib/types';
import {DatabaseService} from '../services/DatabaseService';
import {
	InputValidatorStep,
	TokenProcessorStep,
	SentenceProcessorStep,
	BasicEnricherStep,
	SpecializedEnricherStep,
	SentenceEnricherSteps,
} from './steps/index';

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
		enriched: Array<IWord | IPunctuationSign | IEmoji>;
	};
	song: ISong;
}

export class SongProcessingPipeline extends Pipeline<SongProcessingContext> {
	private readonly db = new DatabaseService();

	constructor() {
		super(
			{
				name: 'SongProcessing',
				stopOnError: true,
			},
			[
				new InputValidatorStep(ContentType.SONG),
				new SentenceProcessorStep(),
				new TokenProcessorStep(),
				new SentenceEnricherSteps(),
				new BasicEnricherStep(),
				new SpecializedEnricherStep(),
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
