'use client';

import {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
import Sentence from '@/components/Sentence';
import {useYoutubePlayer} from '@/lib/hooks/useYoutubePlayer';
import {useScrollPosition} from '@/lib/hooks/useScrollPosition';
import {
	SelectedSongContainer,
	YoutubeContainer,
	PlayerControls,
	ControlButton,
	ModeSelector,
	ModeButton,
} from '@/components/ui/StyledComponents';
import {LearningMode, ISentence} from '@/lib/types/grammar';

export default function SelectedSong() {
	const {id} = useParams();
	const songId = Array.isArray(id) ? id[0] : id;

	const [song, setSong] = useState(null);
	const [sentences, setSentences] = useState<Array<ISentence> | null>(null);
	const [youtubeUrl, setYoutubeUrl] = useState<string>('');
	const {isPlaying, controls} = useYoutubePlayer(youtubeUrl);
	const showControls = useScrollPosition('youtube-player');
	const [learningMode, setLearningMode] = useState<LearningMode>(
		LearningMode.DEFAULT,
	);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (songId) {
			const cachedSongData = localStorage.getItem(`song_${songId}`);

			if (cachedSongData) {
				const songData = JSON.parse(cachedSongData);
				setSong(songData);

				if (songData.metadata?.youtube) {
					setYoutubeUrl(songData.metadata.youtube);
				}

				if (songData.sentences) {
					setSentences(songData.sentences);
				}

				setIsLoading(false);
			} else {
				// Fallback to fetching from API if not in localStorage
				fetch(`/api/songs/${songId}`)
					.then(res => {
						if (!res.ok) throw new Error('Failed to fetch song');
						return res.json();
					})
					.then(songData => {
						setSong(songData);

						if (songData.metadata?.youtube) {
							setYoutubeUrl(songData.metadata.youtube);
						}

						if (songData.sentences) {
							setSentences(songData.sentences);
						}

						setIsLoading(false);
					})
					.catch(error => {
						console.error('Error fetching song:', error);
						setIsLoading(false);
					});
			}
		}
	}, [songId]);

	if (isLoading) return <div>Loading...</div>;
	if (!song) return <div>Song not found</div>;

	return (
		<SelectedSongContainer>
			<YoutubeContainer>
				<div id="youtube-player"></div>
			</YoutubeContainer>
			<PlayerControls visible={Boolean(showControls)}>
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
					active={learningMode === LearningMode.LISTENING_PRACTICE}
					onClick={() => setLearningMode(LearningMode.LISTENING_PRACTICE)}
				>
					Listening Practice
				</ModeButton>
			</ModeSelector>
			{sentences?.map((sentence, index) => (
				<Sentence
					key={`sentence-${index}`}
					sentence={sentence}
					mode={learningMode}
				/>
			))}
		</SelectedSongContainer>
	);
}
