/* eslint-disable */
// @ts-nocheck
import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import Sentences from '../components/Sentence';
// import {API_URL} from '../config';
import {useYoutubePlayer} from '../hooks/useYoutubePlayer';
import {useScrollPosition} from '../hooks/useScrollPosition';
import {
	Container,
	YoutubeContainer,
	PlayerControls,
	ControlButton,
	ModeSelector,
	ModeButton,
} from '../styles/SelectedSong.styles';
import tempTextEntries from '../tempData/text-entries.json';
import tempSentences from '../tempData/sentences.json';
import tempTokens from '../tempData/tokens.json';
import {LearningMode, ISentence} from '@bocaditosespanol/shared';

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
	const [learningMode, setLearningMode] = useState<LearningMode>(
		LearningMode.DEFAULT,
	);

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
			<ModeSelector>
				<ModeButton
					active={learningMode === LearningMode.DEFAULT}
					onClick={() => setLearningMode(LearningMode.DEFAULT)}
				>
					Show All
				</ModeButton>
				<ModeButton
					active={learningMode === LearningMode.HIDE_TRANSLATIONS}
					onClick={() => setLearningMode(LearningMode.HIDE_TRANSLATIONS)}
				>
					Hide Translations
				</ModeButton>
				<ModeButton
					active={learningMode === LearningMode.WRITING_PRACTICE}
					onClick={() => setLearningMode(LearningMode.WRITING_PRACTICE)}
				>
					Writing Practice
				</ModeButton>
			</ModeSelector>
			{sentences?.map((sentence, index) => (
				<Sentences
					key={`sentence-${index}`}
					sentence={sentence}
					mode={learningMode}
				/>
			))}
		</Container>
	);
};
export default SelectedSong;
