import {ISentence} from '../../../../src/lib/types';

export interface ISongData {
	title: string;
	artist: string;
	album: string;
	youtubeVideoId: string;
	spotify: string;
	genre: string[];
	released: string;
	processedLyrics: ISentence[];
}
