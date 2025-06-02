import {ContentType} from '../types/content';
// TODO: move the translations to the sentences factories

export class SentencesInstructionsFactory {
	static createInstruction(contentType: ContentType): string {
		switch (contentType) {
			case ContentType.SONG:
				return this.createSongSentencesInstruction();
			case ContentType.BOOK_EXCERPT:
				return this.createBookExcerptSentencesInstruction();
			case ContentType.VIDEO_TRANSCRIPT:
				return this.createVideoTranscriptSentencesInstruction();
			default:
				throw new Error(`Unsupported content type: ${contentType}`);
		}
	}

	// Base instructions for selecting sentences with learning insights
	private static createBaseSentencesInstruction(
		contextDescription: string,
	): string {
		return `
      You are a Spanish language expert. Your task is to select sentences that provide valuable learning insights for Spanish learners from ${contextDescription}.
      These sentences should showcase interesting vocabulary, idioms, or cultural aspects that may not be immediately obvious to learners.

      Selection Criteria:
      - Focus on valuable insights, not just explanations
      - Avoid sentences that are too obvious
      - Prioritize sentences with learning depth including:
        * Grammar structures that are useful but not intuitive
        * Idiomatic expressions that are common but not directly translatable
        * Cultural references that reflect how Spanish is used in daily life
      - Skip poetic or metaphorical sentences unless they offer clear grammatical or cultural learning value

      What to Avoid:
      - Basic vocabulary or grammar that does not add value
      - Over-explaining sentences
      - Metaphors or poetic expressions unless they are culturally relevant
    `;
	}

	private static createSongSentencesInstruction(): string {
		return this.createBaseSentencesInstruction('song lyrics');
	}

	private static createBookExcerptSentencesInstruction(): string {
		return this.createBaseSentencesInstruction('a book excerpt');
	}

	private static createVideoTranscriptSentencesInstruction(): string {
		return this.createBaseSentencesInstruction('a video transcript');
	}
}
