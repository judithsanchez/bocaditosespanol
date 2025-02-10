export interface ISong {
	songId: string;
	metadata: {
		interpreter: string;
		feat?: string[];
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
