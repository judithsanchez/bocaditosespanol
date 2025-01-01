import {ISong} from '../../../../lib/types';
import songs from '../../data/lyrics/songs.json';

// TODO: cover with tests

export const searchSongs = (query: string): ISong[] => {
	const searchTerm = query.toLowerCase();
	return songs.filter(song => {
		const {interpreter, songName, genre} = song.metadata;
		return (
			interpreter.toLowerCase().includes(searchTerm) ||
			songName.toLowerCase().includes(searchTerm) ||
			genre.toLowerCase().includes(searchTerm)
		);
	});
};
