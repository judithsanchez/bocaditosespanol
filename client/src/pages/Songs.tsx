/**
 * The `SongsPage` component represents the main page for displaying a list of songs.
 * It manages the state of the currently selected song and renders the `Song` component
 * with the selected song's ID.
 */
import {useState} from 'react';

import Song from './Song';

const SongsPage = () => {
	// TODO: change hardcoded songId
	const [selectedSong, setSelectedSong] = useState('a47c');
	return <Song id={selectedSong} />;
};

export default SongsPage;
