export interface ISentence {
	sentence: string;
	tokens: string[];
}

export interface ITextProcessor {
	processedText: ISentence[];
	textData: string;
	processTextData(lyrics: string): ISentence[];
}

// enum MediaType {
// 	song = 'song',
// 	youtubeTranscript = 'youtubeTranscript',
// 	bookExcerpt = 'bookExcerpt',
// }

export interface IText {}

// export interface ISongData {
// 	title: string;
// 	artist: string;
// 	album?: string;
// 	youtubeVideo?: string;
// 	spotify?: string;
// 	genre: string[];
// 	released: string;
// 	lyrics: string;
// }
