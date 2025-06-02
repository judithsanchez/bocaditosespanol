import {IWord, IPunctuationSign, IEmoji} from '@/lib/types/token';
import {
	ContentType,
	ISong,
	IBookExcerpt,
	IVideoTranscript,
} from '@/lib/types/content';

export interface TokenStorage {
	words: Record<string, IWord>;
	punctuationSigns: Record<string, IPunctuationSign>;
	emojis: Record<string, IEmoji>;
}

export interface TextEntriesStorage {
	[ContentType.SONG]?: ISong[];
	[ContentType.BOOK_EXCERPT]?: IBookExcerpt[];
	[ContentType.VIDEO_TRANSCRIPT]?: IVideoTranscript[];
}
