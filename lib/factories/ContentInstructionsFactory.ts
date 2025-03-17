import {ContentType} from '@/lib/types/common';

export class ContentInstructionFactory {
	static createInstruction(contentType: ContentType): string {
		switch (contentType) {
			case 'song':
				return this.createSongInstruction();
			default:
				throw new Error(`Unsupported content type: ${contentType}`);
		}
	}

	private static createSongInstruction(): string {
		return `
      Linguistic Analysis Task for Song Lyrics:

      CRITICAL REQUIREMENTS:
      1. MUST return an ARRAY with EXACTLY the same number of processed sentences
      2. Each sentence must maintain its original position in the array
      3. Process ALL sentences
      4. Consider the artist's dialect and language variants in translations

      STRICT PROCESSING RULES:
      1. OUTPUT MUST BE AN ARRAY of processed sentences
      2. For EACH sentence:
         - ADD complete English contextual translation considering artist's dialect
         - ADD literal word-for-word translation that maintains original grammar structure
         - KEEP all other existing properties untouched

      3. Response Format:
         - Must be an array matching input length
         - Must follow exact schema structure
         - Must preserve sentence order
    `;
	}
}
