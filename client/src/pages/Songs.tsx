/**
 * The `SongsPage` component represents the main page for displaying a list of songs.
 * It manages the state of the currently selected song and renders the `Song` component
 * with the selected song's ID.
 */
import {useState, useEffect, useContext} from 'react';
import Song from './Song';
import {SongContext, SongProvider} from '../context/SongContext';
import songsData from '../../../src/data/db.json';
import SongActivitySelector from '../components/SongActivitySelector';
import {songsActivities} from '../components/lib/constants';

const SongsPage = () => {
	const [songs, setSongs] = useState([]);
	const [selectedSong, setSelectedSong] = useState('');
	const {activityType} = useContext(SongContext); // Destructure activityType from SongContext

	useEffect(() => {
		setSongs(songsData.songs); // TODO: fix types
	}, []);

	const handleSongClick = songId => {
		setSelectedSong(songId);
	};

	return (
		<>
			<SongActivitySelector />
			{console.log(activityType?.label)}

			<div>
				{songs.map(song => (
					<button key={song.id} onClick={() => handleSongClick(song.id)}>
						{song.title}
					</button>
				))}
			</div>

			{activityType &&
				activityType?.label.toLowerCase() ===
					songsActivities.lyrics.label.toLowerCase() &&
				selectedSong && <Song id={selectedSong} activityType={activityType} />}
		</>
	);
};

export default SongsPage;
