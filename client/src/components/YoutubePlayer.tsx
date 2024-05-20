import React, {useEffect, useRef} from 'react';
import styles from './styles/YoutubePlayer.module.css'; // Import CSS module

const YoutubePlayer = ({videoId}) => {
	const playerRef = useRef(null);

	useEffect(() => {
		// Create a new YouTube player instance
		const player = new window.YT.Player(playerRef.current, {
			height: '360',
			width: '640',
			videoId: videoId,
			events: {
				onReady: onPlayerReady,
				onStateChange: onPlayerStateChange,
			},
		});

		// Event handlers for the YouTube player
		function onPlayerReady(event) {
			event.target.playVideo();
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
