import {useRef, useState, useEffect} from 'react';

declare global {
	interface Window {
		YT: {
			Player: any;
			PlayerState: {
				PLAYING: number;
			};
		};
		onYouTubeIframeAPIReady: () => void;
	}
}

export const useYoutubePlayer = (youtubeUrl: string) => {
	const playerRef = useRef<any | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);

	const getVideoIdFromUrl = (url: string) => {
		const regExp =
			/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return match && match[2].length === 11 ? match[2] : null;
	};

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
		if (!videoId) return;

		playerRef.current = new window.YT.Player('youtube-player', {
			height: '200',
			width: '350',
			videoId,
			playerVars: {
				controls: 1,
				rel: 0,
			},
			events: {
				onReady: (event: {target: any}) => {
					playerRef.current = event.target;
				},
				onStateChange: (event: {data: number}) => {
					setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
				},
			},
		});
	};

	const controls = {
		togglePlayPause: () => {
			if (playerRef.current) {
				isPlaying
					? playerRef.current.pauseVideo()
					: playerRef.current.playVideo();
			}
		},
		seekForward: () => {
			if (playerRef.current) {
				const currentTime = playerRef.current.getCurrentTime();
				playerRef.current.seekTo(currentTime + 5, true);
			}
		},
		seekBackward: () => {
			if (playerRef.current) {
				const currentTime = playerRef.current.getCurrentTime();
				playerRef.current.seekTo(currentTime - 5, true);
			}
		},
	};

	useEffect(() => {
		if (youtubeUrl && typeof window !== 'undefined') {
			initializePlayer();
		}

		// Cleanup the player on unmount
		return () => {
			if (playerRef.current) {
				playerRef.current.destroy();
			}
		};
	}, [youtubeUrl]);

	return {playerRef, isPlaying, controls};
};
