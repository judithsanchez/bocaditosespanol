/**
 * Renders a page that displays the details of a song.
 *
 * @param {object} props - The component props.
 * @param {string} props.id - The ID of the song to display.
 * @returns {JSX.Element} - The rendered SongPage component.
 */
import {useState, useEffect} from 'react';
import TextAndTranslation from '../components/TextAndTranslation';
import YoutubePlayer from '../components/YoutubePlayer';
import styles from './styles/Song.module.css';
import {ISongData} from './lib/types';
import dbData from '../../../src/data/db.json';

// TODO: extract hardcoded strings and api routes

const SongPage = (
	{id}: {id: string},
	{activityType}: {activityType: string},
) => {
	const [songData, setSongData] = useState<ISongData | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const songData = dbData.songs.find(song => song.id === id);
				if (!songData) {
					throw new Error('Song not found'); // TODO: extract hardcoded strings
				}
				setSongData(songData); // TODO: fix type issue
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};

		fetchData();
	}, [id]);

	return (
		<div className={styles.container}>
			<div className={styles.video}>
				{songData && songData.youtubeVideoId && (
					<YoutubePlayer videoId={songData.youtubeVideoId} />
				)}
			</div>

			<div className={styles.lyrics}>
				{songData && songData.processedLyrics ? (
					songData.processedLyrics.map((sentence, index) => (
						<TextAndTranslation key={index} sentence={sentence} />
					))
				) : (
					<div>Loading...</div>
				)}
			</div>
		</div>
	);
};

export default SongPage;
