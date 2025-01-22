/* eslint-disable */
// @ts-nocheck

import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';
// import {API_URL} from '../config';
import textEntries from '../tempData/text-entries.json';

interface Song {
	songId: string;
	metadata: {
		interpreter: string;
		title: string;
		youtubeTrackId: string;
	};
}

const Container = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const SearchInput = styled.input`
	width: 80%;
	padding: 0.8rem;
	margin: 2rem; // Added horizontal margins
	border-radius: 8px;
	border: 2px solid ${props => props.theme.colors.surface};
	font-size: 1.1rem;
	background-color: ${props => props.theme.colors.surface};
	color: ${props => props.theme.colors.onSurface};

	&:focus {
		outline: none;
		border-color: ${props => props.theme.colors.primary};
	}
`;
const Title = styled.h1`
	color: ${props => props.theme.colors.onBackground};
	margin-bottom: 2rem;
	text-align: center;
`;

const SongListContainer = styled.div`
	width: 80%; // This creates the narrower content area
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const SongButton = styled.button`
	width: 100%; // Now this is 100% of the SongListContainer
	padding: 1rem;
	margin: 0.5rem 0;
	border-radius: 8px;
	border: none;
	background-color: ${props => props.theme.colors.surface};
	color: ${props => props.theme.colors.onSurface};
	cursor: pointer;
	transition: all 0.2s ease;
	font-size: 1.1rem;

	&:hover {
		background-color: ${props => props.theme.colors.secondary};
		color: ${props => props.theme.colors.background};
		transform: translateY(-2px);
	}
`;

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
