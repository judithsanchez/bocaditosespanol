// import {useState, useEffect} from 'react';
// import {ISong} from '../../lib/types';
// import {
// 	getAllSongs,
// 	getSongById,
// 	getSongsByInterpreter,
// 	getSongsByGenre,
// 	searchSongs,
// } from '../../backend/src/utils/index';

// export const useSongs = () => {
// 	const [songs, setSongs] = useState<ISong[]>([]);
// 	const [loading, setLoading] = useState(true);
// 	const [error, setError] = useState<string | null>(null);

// 	useEffect(() => {
// 		try {
// 			const allSongs = getAllSongs();
// 			setSongs(allSongs);
// 		} catch (err) {
// 			setError(err instanceof Error ? err.message : 'Failed to fetch songs');
// 		} finally {
// 			setLoading(false);
// 		}
// 	}, []);

// 	const getSongDetails = (songId: string) => getSongById(songId);
// 	const getByInterpreter = (interpreter: string) =>
// 		getSongsByInterpreter(interpreter);
// 	const getByGenre = (genre: string) => getSongsByGenre(genre);
// 	const search = (query: string) => searchSongs(query);

// 	return {
// 		songs,
// 		loading,
// 		error,
// 		getSongDetails,
// 		getByInterpreter,
// 		getByGenre,
// 		search,
// 	};
// };
