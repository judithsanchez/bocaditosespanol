import {ISong} from '../../../../lib/types';
import songs from '../../data/lyrics/songs.json';

// TODO: cover with tests

export const getSongsByInterpreter = (interpreter: string): ISong[] => {
	return songs.filter(song =>
		song.metadata.interpreter.toLowerCase().includes(interpreter.toLowerCase()),
	);
};
