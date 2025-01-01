import {ISong} from '../../../../lib/types';
import songs from '../../data/lyrics/songs.json';

// TODO: cover with tests

export const getSongById = (songId: string): ISong | undefined => {
	return songs.find(song => song.songId === songId);
};
