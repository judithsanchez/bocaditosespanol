/**
 * The `SongsPage` component represents the main page for displaying a list of songs.
 * It manages the state of the currently selected song and renders the `Song` component
 * with the selected song's ID.
 */
import {useState, useEffect} from 'react';
import Song from './Song';
import songsData from '../../../src/data/db.json';
// import SongActivitySelector from '../components/SongActivitySelector';

const SongsPage = () => {
	const [songs, setSongs] = useState([]);
	const [selectedSong, setSelectedSong] = useState('');

	useEffect(() => {
		setSongs(songsData.songs); // TODO: fix types
	}, []);

	const handleSongClick = songId => {
		setSelectedSong(songId);
	};

	return (
		<>
			{/* <SongActivitySelector /> */}

			<div>
				{songs.map(song => (
					<button key={song.id} onClick={() => handleSongClick(song.id)}>
						{song.title}
					</button>
				))}
			</div>

			{selectedSong && <Song id={selectedSong} />}
		</>
	);
};

export default SongsPage;
