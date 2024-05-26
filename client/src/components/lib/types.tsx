import {ISentence} from '../../../../src/lib/types';

export interface SongData {
	title: string;
	artist: string;
	album: string;
	youtubeVideo: string;
	spotify: string;
	genre: string[];
	released: string;
	lyrics: string;
	processedLyrics: ISentence[];
}

export interface PageSection {
	label: string;
	path: string;
	component: React.FC;
	isPublic?: boolean;
}

export interface TextAndTranslationProps {
	sentence: ISentence;
}
