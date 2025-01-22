export type ISentence = {
	sentenceId: string;
	content: string;
	translations: {
		english: {
			literal: string;
			contextual: string;
		};
	};
	tokenIds: string[];
	tokens: Token[];
};

export type Token = {
	content: string;
	tokenType: string;
	partOfSpeech?: string;
	translations?: {
		english: string[];
	};
};

export interface TokensData {
	words: Record<string, Record<string, Token>>;
	punctuationSigns: string;
	emojis: string;
}

export enum LearningMode {
	DEFAULT = 'default',
	HIDE_TRANSLATIONS = 'hideTranslations',
	WRITING_PRACTICE = 'writingPractice',
}
