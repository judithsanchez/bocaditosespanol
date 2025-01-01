import {useState, useEffect} from 'react';
import {ISong} from '../../lib/types';
import songsData from '../tempData/songs.json';

export const useSongs = () => {
	const [songs, setSongs] = useState<ISong[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		try {
			setSongs(songsData);
			setLoading(false);
		} catch (err) {
			setError('Failed to load songs');
			setLoading(false);
		}
	}, []);

	return {songs, loading, error};
};
