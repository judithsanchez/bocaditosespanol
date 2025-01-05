export interface AddSongRequest {
	interpreter: string;
	feat?: string;
	title: string;
	youtube: string;
	genre: string[];
	language: string;
	releaseDate: string;
	lyrics: string;
}

export interface ISong {
	songId: string;
	metadata: {
		interpreter: string;
		feat?: string;
		title: string;
		youtube: string;
		genre: string[];
		language: string;
		releaseDate: string;
	};
	lyrics: string[]; // TODO: rename to sentencesIds or something similar
	createdAt: string;
	updatedAt: string;
}

export interface ISentence {
	sentenceId: string;
	content: string;
	translation: string;
	literalTranslation: string;
	tokenIds: string[];
}
