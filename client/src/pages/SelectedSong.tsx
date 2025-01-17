import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import styled from 'styled-components';
import Sentences from '../components/Sentence';
import {API_URL} from '../config';

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

const SpotifyContainer = styled.div`
	position: sticky;
	top: 4.5rem; // NavBar height (4rem) + 1rem spacing
	width: 350px;
	height: 80px;
	border-radius: 8px;
	overflow: hidden;
	z-index: 1; // Lower than NavBar's z-index but higher than content
	background: ${props =>
		props.theme.colors.background}; // Match your theme background

	iframe {
		border: none;
		width: 100%;
		height: 100%;
		border-radius: 8px;
	}
`;

const SelectedSong = () => {
	const {songId} = useParams();
	const [sentences, setSentences] = useState<Array<ISentence> | null>(null);
	const [spotifyUrl, setSpotifyUrl] = useState<string>('');

	useEffect(() => {
		if (songId) {
			fetch(`${API_URL}/songs/${songId}`)
				.then(response => response.json())
				.then(data => {
					data.sentences.forEach((sentence: ISentence, index: number) => {
						if (sentence.tokens.some(token => token === null)) {
							console.log(`Found null token in sentence ${index}:`, sentence);
						}
					});
					setSentences(data.sentences);
					setSpotifyUrl(data.metadata.spotify);
				});
		}
	}, [songId]);

	if (!sentences) {
		return <div>Loading...</div>;
	}

	return (
		<Container>
			<SpotifyContainer>
				<iframe
					style={{borderRadius: '12px'}}
					src={spotifyUrl}
					width="100%"
					allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
					loading="lazy"
				></iframe>
			</SpotifyContainer>

			{sentences &&
				sentences.map((sentence, index) => (
					<Sentences key={`sentence-${index}`} sentence={sentence} />
				))}
		</Container>
	);
};

export default SelectedSong;
