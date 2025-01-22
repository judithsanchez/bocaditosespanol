export interface Song {
	songId: string;
	metadata: {
		interpreter: string;
		title: string;
		youtubeTrackId: string;
	};
}
