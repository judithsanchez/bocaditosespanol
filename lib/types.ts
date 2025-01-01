export interface ISong {
	songId: string;
	metadata: {
		interpreter: string;
		feat?: string;
		songName: string;
		youtube: string;
		genre: string;
		language: string;
		releaseDate: string;
	};
	jsonFiles: {
		raw: string;
		processed: string;
	};
	createdAt: string;
	updatedAt: string;
}
