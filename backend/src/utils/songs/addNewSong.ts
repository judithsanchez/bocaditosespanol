import {errors} from '../../lib/constants';
import {AddSongRequest} from '../../../../lib/types';
import {TextProcessor} from '../../utils/TextProcessor';
import {saveToDatabase} from '../../utils/saveToDatabase';
import {Logger} from '../Logger';

const logger = new Logger('AddNewSong');

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
		logger.error('Invalid song data provided', new Error(errors.invalidData));
		throw new Error(errors.invalidData);
	}

	try {
		logger.info('Creating text processor', {title: songData.title});
		const processor = new TextProcessor(songData);

		logger.info('Processing text');
		await processor.processText();

		logger.info('Saving to database');
		await saveToDatabase({
			song: processor.formattedTextEntry,
			sentences: processor.enrichedSentences,
			tokens: processor.enrichedTokens,
		});

		const result = {
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

		logger.info('Song processing completed', {stats: result.stats});
		logger.end('addNewSong');
		return result;
	} catch (error) {
		logger.error('Failed to process song', error);
		throw new Error(`${errors.processingError}: ${error}`);
	}
}
