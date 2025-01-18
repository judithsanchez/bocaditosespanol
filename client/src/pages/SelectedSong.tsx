/* eslint-disable */
// @ts-nocheck
import {useEffect, useState} from 'react';
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
	position: sticky;
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

const SelectedSong = () => {
	const {songId} = useParams();
	const [sentences, setSentences] = useState<Array<ISentence> | null>(null);
	const [youtubeUrl, setyoutubeUrl] = useState<string>('');

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

	// useEffect(() => {
	// 	if (songId) {
	// 		fetch(`${API_URL}/songs/${songId}`)
	// 			.then(response => response.json())
	// 			.then(data => {
	// 				data.sentences.forEach((sentence: ISentence, index: number) => {
	// 					if (sentence.tokens.some(token => token === null)) {
	// 						console.log(`Found null token in sentence ${index}:`, sentence);
	// 					}
	// 				});
	// 				setSentences(data.sentences);
	// 				setyoutubeUrl(data.metadata.youtube);
	// 			});
	// 	}
	// }, [songId]);

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
			console.log(tokens);

			const sentencesWithTokens = songSentences.map(sentence => ({
				...sentence,
				tokens: sentence.tokenIds
					.map(tokenId => tokens.find(token => token.tokenId === tokenId))
					.filter(Boolean),
			}));

			setSentences(sentencesWithTokens);
		}
	}, [songId]);

	if (!sentences) {
		return <div>Loading...</div>;
	}

	return (
		<Container>
			<YoutubeContainer>
				<iframe
					width="350px"
					height="200px"
					style={{borderRadius: '10px'}}
					src={youtubeUrl}
					title="YouTube video player"
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					referrerpolicy="strict-origin-when-cross-origin"
				></iframe>
			</YoutubeContainer>

			{sentences &&
				sentences.map((sentence, index) => (
					<Sentences key={`sentence-${index}`} sentence={sentence} />
				))}
		</Container>
	);
};

export default SelectedSong;
