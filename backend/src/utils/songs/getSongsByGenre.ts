import {ISong} from '../../../../lib/types';
import songs from '../../data/lyrics/songs.json';

// TODO: cover with tests

export const getSongsByGenre = (genre: string): ISong[] => {
	return songs.filter(
		song => song.metadata.genre.toLowerCase() === genre.toLowerCase(),
	);
};
