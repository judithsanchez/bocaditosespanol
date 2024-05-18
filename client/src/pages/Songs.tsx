import {useState} from 'react';

import Song from './Song';

const SongsPage = () => {
	const [selectedSong, setSelectedSong] = useState('a47c');
	return <Song id={selectedSong} />;
};

export default SongsPage;
