import {themes} from './constants';

export enum ActivityType {
	Transcription = 'transcription',
	CompleteSentence = 'complete sentence',
	TranslateSentence = 'translate sentence',
}

export type Theme = typeof themes.light | typeof themes.dark;
export interface AppContextProps {
	theme: Theme;
	toggleTheme: () => void;
	activityType: ActivityType;
	setActivityType: (activityType: ActivityType) => void;
	contentId: string | null;
	setContentId: (contentId: string | null) => void;
}

export interface AppContextValue {
	theme: Theme;
	toggleTheme: () => void;
	activityType: ActivityType;
	setActivityType: (activityType: ActivityType) => void;
	selectedContentId: string | null;
	setSelectedContentId: (contentId: string | null) => void;
}
