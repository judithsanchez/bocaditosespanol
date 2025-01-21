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
	justify-content: center;
	gap: 1rem;
	padding: 1rem;
	background: ${props => props.theme.colors.background};
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
	transition: transform 0.3s ease;
	transform: translateY(${props => (props.visible ? '0' : '100%')});
	z-index: 1000; // Make sure this is higher than other elements
`;

const ControlButton = styled.button`
	padding: 0.5rem 1rem;
	border-radius: 4px;
	border: none;
	background: ${props => props.theme.colors.primary};
	color: white;
	cursor: pointer;

	&:hover {
		opacity: 0.9;
	}
`;

declare global {
	interface Window {
		YT: any;
		onYouTubeIframeAPIReady: () => void;
	}
}
const SelectedSong = () => {
	const {songId} = useParams();
	const [sentences, setSentences] = useState<Array<ISentence> | null>(null);
	const [youtubeUrl, setyoutubeUrl] = useState<string>('');
	const playerRef = useRef<any>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [showFloatingControls, setShowFloatingControls] = useState(false);
	const videoContainerRef = useRef(null);

	// Player control functions defined first
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
		const videoId = youtubeUrl.split('embed/').pop()?.split('?')[0]; // Better URL parsing

		playerRef.current = new window.YT.Player('youtube-player', {
			height: '200',
			width: '350',
			videoId,
			playerVars: {
				controls: 1, // Hide default controls
				rel: 0, // Don't show related videos
			},
			events: {
				onReady: event => {
					// Player is ready to receive commands
					playerRef.current = event.target; // This is important!
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

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				console.log('Intersection ratio:', entry.intersectionRatio);
				console.log('Is intersecting:', entry.isIntersecting);
				setShowFloatingControls(!entry.isIntersecting);
			},
			{
				threshold: 0.5,
			},
		);

		console.log('Video container ref:', videoContainerRef.current);
		if (videoContainerRef.current) {
			observer.observe(videoContainerRef.current);
		}

		return () => observer.disconnect();
	}, []);

	if (!sentences) {
		return <div>Loading...</div>;
	}

	return (
		<Container>
			<YoutubeContainer ref={videoContainerRef}>
				<div id="youtube-player"></div>
			</YoutubeContainer>
			<PlayerControls visible={showFloatingControls}>
				<ControlButton onClick={seekBackward}>-5s</ControlButton>
				<ControlButton onClick={togglePlayPause}>
					{isPlaying ? 'Pause' : 'Play'}
				</ControlButton>
				<ControlButton onClick={seekForward}>+5s</ControlButton>
			</PlayerControls>
			{sentences &&
				sentences.map((sentence, index) => (
					<Sentences key={`sentence-${index}`} sentence={sentence} />
				))}
		</Container>
	);
};

export default SelectedSong;
