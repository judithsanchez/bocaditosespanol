import React, {useEffect, useRef} from 'react';
import styles from './styles/YoutubePlayer.module.css';

const YoutubePlayer = ({videoId}) => {
	const playerRef = useRef(null);

	useEffect(() => {
		const player = new window.YT.Player(playerRef.current, {
			height: '100%',
			width: '100%',
			videoId: videoId,
			events: {
				onReady: onPlayerReady,
				onStateChange: onPlayerStateChange,
			},
		});

		// Event handlers for the YouTube player
		function onPlayerReady(event) {
			// Removed the line that plays the video
		}

		function onPlayerStateChange(event) {
			// Handle player state changes if needed
		}
	}, [videoId]);

	return (
		<div className={styles.container}>
			<div ref={playerRef} />
		</div>
	);
};

export default YoutubePlayer;
