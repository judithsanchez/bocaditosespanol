/* eslint-disable */
// @ts-nocheck
import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import Sentences from '../components/Sentence';
// import {API_URL} from '../config';
import {useYoutubePlayer} from '../hooks/useYoutubePlayer';
import {useScrollPosition} from '../hooks/useScrollPosition';
import {ISentence} from '../types/SelectedSong.types';
import {
	Container,
	YoutubeContainer,
	PlayerControls,
	ControlButton,
} from '../styles/SelectedSong.styles';
import tempTextEntries from '../tempData/text-entries.json';
import tempSentences from '../tempData/sentences.json';
import tempTokens from '../tempData/tokens.json';
type TokensData = {
	words: Record<string, Record<string, IWord>>;
	punctuationSigns: Record<string, IPunctuationSign>;
	emojis: Record<string, IEmoji>;
};

const getAllTokens = (tokensData: TokensData) => {
	const allTokens: Array<IWord | IPunctuationSign | IEmoji> = [];

	Object.values(tokensData.words).forEach(category => {
		allTokens.push(...Object.values(category));
	});

	allTokens.push(...Object.values(tokensData.punctuationSigns));

	allTokens.push(...Object.values(tokensData.emojis));

	return allTokens;
};

const SelectedSong = () => {
	const {songId} = useParams();
	const [sentences, setSentences] = useState<Array<ISentence> | null>(null);
	const [youtubeUrl, setYoutubeUrl] = useState<string>('');
	const {isPlaying, controls} = useYoutubePlayer(youtubeUrl);
	const showControls = useScrollPosition('youtube-player');

	useEffect(() => {
		if (songId) {
			const songEntry = tempTextEntries.song.find(
				(entry: any) => entry.songId === songId,
			);

			if (!songEntry) return null;

			setYoutubeUrl(songEntry.metadata.youtube);

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

	if (!sentences) return <div>Loading...</div>;

	return (
		<Container>
			<YoutubeContainer>
				<div id="youtube-player"></div>
			</YoutubeContainer>
			<PlayerControls visible={showControls}>
				<ControlButton onClick={controls.seekBackward}>⏪</ControlButton>
				<ControlButton onClick={controls.togglePlayPause}>
					{isPlaying ? '⏸️' : '▶️'}
				</ControlButton>
				<ControlButton onClick={controls.seekForward}>⏩</ControlButton>
			</PlayerControls>
			{sentences?.map((sentence, index) => (
				<Sentences key={`sentence-${index}`} sentence={sentence} />
			))}
		</Container>
	);
};
export default SelectedSong;
