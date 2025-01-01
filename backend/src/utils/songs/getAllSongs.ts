import {ISong} from '../../../../lib/types';
import songs from '../../data/lyrics/songs.json';

// TODO: cover with tests
export const getAllSongs = (): ISong[] => {
	return songs;
};
