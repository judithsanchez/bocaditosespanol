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
	lyrics: string[];
	createdAt: string;
	updatedAt: string;
}

export interface ISentence {
	sentenceId: string;
	content: string;
	translations: {
		english: {
			literal: Promise<string> | string;
			contextual: Promise<string> | string;
		};
	};
	tokenIds: string[];
}
