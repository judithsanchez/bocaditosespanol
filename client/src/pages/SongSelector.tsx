/* eslint-disable */
// @ts-nocheck

import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';
// import {API_URL} from '../config';
import textEntries from '../tempData/text-entries.json';
import {Song} from '../types/song.types';
import {
	Container,
	SearchInput,
	SongListContainer,
	SongButton,
} from '../styles/SongSelector.styles';

const SongSelector = () => {
	const [songs, setSongs] = useState<Song[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const navigate = useNavigate();

	// useEffect(() => {
	// 	fetch(`${API_URL}/songs`)
	// 		.then(response => response.json())
	// 		.then(data => setSongs(data))
	// 		.catch(error => console.error('Error fetching songs:', error));
	// }, []);

	useEffect(() => {
		const songs = textEntries.song || [];
		const simplifiedSongs = songs.map(song => ({
			songId: song.songId,
			metadata: song.metadata,
		}));
		setSongs(simplifiedSongs);
	}, []);

	const filteredSongs = songs.filter(song => {
		const searchTermLower = searchTerm.toLowerCase();
		return (
			song.metadata.title.toLowerCase().includes(searchTermLower) ||
			song.metadata.interpreter.toLowerCase().includes(searchTermLower)
		);
	});

	return (
		<Container>
			<SearchInput
				type="text"
				placeholder="Search by title or interpreter..."
				value={searchTerm}
				onChange={e => setSearchTerm(e.target.value)}
			/>
			<SongListContainer>
				{filteredSongs.map(song => (
					<SongButton
						key={song.songId}
						onClick={() => navigate(`/songs/${song.songId}`)}
					>
						{song.metadata.title} - {song.metadata.interpreter}
					</SongButton>
				))}
			</SongListContainer>
		</Container>
	);
};

export default SongSelector;
