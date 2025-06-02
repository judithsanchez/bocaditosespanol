import {
	WordToken,
	PunctuationToken,
	EmojiToken,
	// InitialWordToken might also be relevant if tokens.json stores words before full sense enrichment
	// For now, assuming words in TokenStorage are fully processed WordToken.
	// If TokenIdentificationStep saves InitialWordTokens, this might need adjustment.
	// However, ContentProcessingPipeline finalizes tokens before saving, so WordToken should be appropriate.
} from '@/lib/types/token';
import {
	ContentType,
	SongContent,
	BookExcerptContent,
	VideoTranscriptContent,
	// ProcessedContent, // Base type, specific ones are better here
} from '@/lib/types/content';

export interface TokenStorage {
	words: Record<string, WordToken>; // Changed from IWord
	punctuationSigns: Record<string, PunctuationToken>; // Changed from IPunctuationSign
	emojis: Record<string, EmojiToken>; // Changed from IEmoji
}

export interface TextEntriesStorage {
	[ContentType.SONG]?: SongContent[]; // Changed from ISong
	[ContentType.BOOK_EXCERPT]?: BookExcerptContent[]; // Changed from IBookExcerpt
	[ContentType.VIDEO_TRANSCRIPT]?: VideoTranscriptContent[]; // Changed from IVideoTranscript
}
