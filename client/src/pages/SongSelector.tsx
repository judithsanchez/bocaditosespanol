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

const Title = styled.h1`
	color: ${props => props.theme.colors.onBackground};
	margin-bottom: 2rem;
	text-align: center;
`;

const SongButton = styled.button`
	width: 100%;
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
		background-color: ${props => props.theme.colors.primaryContainer};
		color: ${props => props.theme.colors.onPrimaryContainer};
		transform: translateY(-2px);
	}
`;

const SongSelector = () => {
	const [songs, setSongs] = useState<Song[]>([]);
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

	return (
		<Container>
			<Title>Choose a Song</Title>
			{songs.map(song => (
				<SongButton
					key={song.songId}
					onClick={() => navigate(`/songs/${song.songId}`)}
				>
					{song.metadata.title} - {song.metadata.interpreter}
				</SongButton>
			))}
		</Container>
	);
};

export default SongSelector;
