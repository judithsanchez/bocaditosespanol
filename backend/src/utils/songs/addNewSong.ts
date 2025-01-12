import {errors} from '../../lib/constants';
import {AddSongRequest} from '../../../../lib/types';
import {TextProcessor} from '../TextProcessor';
import {DatabaseService} from '../../services/DatabaseService';
import {Logger} from '../Logger';

const logger = new Logger('AddNewSong');
const db = new DatabaseService();

export async function addNewSong(songData: AddSongRequest) {
	logger.start('addNewSong');

	if (
		!songData.interpreter ||
		!songData.title ||
		!songData.youtube ||
		!songData.genre ||
		!songData.language ||
		!songData.releaseDate ||
		!songData.lyrics
	) {
		throw new Error(errors.invalidData);
	}

	try {
		const processor = new TextProcessor(songData);
		await processor.processText();

		await Promise.all([
			db.saveSong(processor.formattedTextEntry),
			db.saveSentences(processor.enrichedSentences),
			db.saveTokens(processor.enrichedTokens),
		]);

		return {
			song: processor.formattedTextEntry,
			sentences: processor.enrichedSentences,
			tokens: processor.enrichedTokens,
			stats: {
				originalSentencesCount: processor.splittedParagraph.length,
				originalSentencesIds: processor.originalSentencesIds,
				deduplicatedSentencesCount: processor.deduplicatedSentences.length,
				originalTokensCount: processor.originalTokens.length,
				deduplicatedTokensCount: processor.deduplicatedTokens.length,
				enrichenedSentencesCount: processor.enrichedSentences.length,
				enrichenedTokensCount: processor.enrichedTokens.length,
			},
		};
	} catch (error) {
		throw new Error(`${errors.processingError}: ${error}`);
	}
}
