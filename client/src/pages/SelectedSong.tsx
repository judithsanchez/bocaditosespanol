/* eslint-disable */
// @ts-nocheck
import {useEffect, useState, useRef} from 'react';
import {useParams} from 'react-router-dom';
import styled from 'styled-components';
import Sentences from '../components/Sentence';
// import {API_URL} from '../config';
import tempTextEntries from '../tempData/text-entries.json';
import tempSentences from '../tempData/sentences.json';
import tempTokens from '../tempData/tokens.json';

type ISentence = {
	sentenceId: string;
	content: string;
	translations: {
		english: {
			literal: string;
			contextual: string;
		};
	};
	tokenIds: string[];
	tokens: Token[];
};

type Token = {
	content: string;
	tokenType: string;
	partOfSpeech?: string;
	translations?: {
		english: string[];
	};
};

const getVideoIdFromUrl = (url: string) => {
	const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
	const match = url.match(regExp);
	return match && match[2].length === 11 ? match[2] : null;
};

const Container = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2rem;
	padding: 2rem;
`;

const YoutubeContainer = styled.div`
	// position: sticky;
	top: 4.5rem; // NavBar height (4rem) + 0.5rem spacing
	width: 350px;
	height: 200px;
	border-radius: 8px;
	overflow: hidden;
	z-index: 1; // Lower than NavBar's z-index but higher than content
	margin-bottom: 2rem;
	background: ${props => props.theme.colors.background};

	iframe {
		border: none;
		width: 100%;
		height: 100%;
		border-radius: 8px;
	}
`;

const PlayerControls = styled.div`
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: 1.2rem 4rem;
	background: ${props => props.theme.colors.surface};
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
	z-index: 1000;
`;

const ControlButton = styled.button`
	width: 50px;
	height: 50px;
	border-radius: 50%; // This makes it perfectly round
	border: none;
	background: ${props => props.theme.colors.primary};
	color: ${props => props.theme.colors.onPrimary};
	font-size: 1.5rem;
	cursor: pointer;
	display: flex;
	justify-content: center;
	align-items: center;
	transition: transform 0.2s ease;

	&:hover {
		transform: scale(1.05);
		background: ${props => props.theme.colors.primaryContainer};
		color: ${props => props.theme.colors.onPrimaryContainer};
	}

	&:active {
		transform: scale(0.95);
	}
`;
declare global {
	interface Window {
		YT: any;
		onYouTubeIframeAPIReady: () => void;
	}
}
const SelectedSong = () => {
	const videoContainerRef = useRef<HTMLDivElement>(null);
	const {songId} = useParams();
	const [sentences, setSentences] = useState<Array<ISentence> | null>(null);
	const [youtubeUrl, setyoutubeUrl] = useState<string>('');
	const playerRef = useRef<any>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [showFloatingControls, setShowFloatingControls] = useState(false);

	const togglePlayPause = () => {
		if (playerRef.current) {
			if (isPlaying) {
				playerRef.current.pauseVideo();
			} else {
				playerRef.current.playVideo();
			}
		}
	};

	const seekForward = () => {
		if (playerRef.current) {
			const currentTime = playerRef.current.getCurrentTime();
			playerRef.current.seekTo(currentTime + 5, true);
		}
	};

	const seekBackward = () => {
		if (playerRef.current) {
			const currentTime = playerRef.current.getCurrentTime();
			playerRef.current.seekTo(currentTime - 5, true);
		}
	};

	interface TokensData {
		words: Record<string, Record<string, IWord>>;
		punctuationSigns: Record<string, IPunctuationSign>;
		emojis: Record<string, IEmoji>;
	}

	const getAllTokens = (tokensData: TokensData) => {
		const allTokens: Array<IWord | IPunctuationSign | IEmoji> = [];

		Object.values(tokensData.words).forEach(category => {
			allTokens.push(...Object.values(category));
		});

		allTokens.push(...Object.values(tokensData.punctuationSigns));

		allTokens.push(...Object.values(tokensData.emojis));

		return allTokens;
	};

	useEffect(() => {
		if (songId) {
			const songEntry = tempTextEntries.song.find(
				(entry: any) => entry.songId === songId,
			);

			if (!songEntry) {
				console.log('Song not found');
				return null;
			}

			setyoutubeUrl(songEntry.metadata.youtube);

			const songSentences = tempSentences[songId];

			const tokens = getAllTokens(tempTokens);

			const sentencesWithTokens = songSentences.map(sentence => ({
				...sentence,
				tokens: sentence.tokenIds
					.map(tokenId => tokens.find(token => token.tokenId === tokenId))
					.filter(Boolean),
			}));

			setSentences(sentencesWithTokens);
		}
	}, [songId]);

	const initializePlayer = () => {
		if (!window.YT) {
			const tag = document.createElement('script');
			tag.src = 'https://www.youtube.com/iframe_api';
			const firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

			window.onYouTubeIframeAPIReady = () => {
				createPlayer();
			};
		} else {
			createPlayer();
		}
	};

	const createPlayer = () => {
		const videoId = getVideoIdFromUrl(youtubeUrl);

		if (!videoId) {
			console.log('Invalid YouTube URL');
			return;
		}

		playerRef.current = new window.YT.Player('youtube-player', {
			height: '200',
			width: '350',
			videoId,
			playerVars: {
				controls: 1,
				rel: 0,
			},
			events: {
				onReady: event => {
					playerRef.current = event.target;
				},
				onStateChange: event => {
					setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
				},
			},
		});
	};

	useEffect(() => {
		if (youtubeUrl) {
			initializePlayer();
		}
	}, [youtubeUrl]);

	if (!sentences) {
		return <div>Loading...</div>;
	}
	return (
		<Container>
			<YoutubeContainer>
				<div id="youtube-player"></div>
			</YoutubeContainer>
			<PlayerControls>
				<ControlButton onClick={seekBackward}>⏪</ControlButton>
				<ControlButton onClick={togglePlayPause}>
					{isPlaying ? '⏸️' : '▶️'}
				</ControlButton>
				<ControlButton onClick={seekForward}>⏩</ControlButton>
			</PlayerControls>
			{sentences?.map((sentence, index) => (
				<Sentences key={`sentence-${index}`} sentence={sentence} />
			))}
		</Container>
	);
};
export default SelectedSong;
