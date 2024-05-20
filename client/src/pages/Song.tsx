/**
 * Renders a page that displays the details of a song.
 *
 * @param {object} props - The component props.
 * @param {string} props.id - The ID of the song to display.
 * @returns {JSX.Element} - The rendered SongPage component.
 */
import {useState, useEffect} from 'react';
import TextAndTranslation from '../components/TextAndTranslation';
import {ISentence} from '../../../src/lib/types';
import YoutubePlayer from '../components/YoutubePlayer';
import styles from './styles/Song.module.css';
// TODO: extract hardcoded strings and api routes

// TODO: move to types file
export interface ISongData {
	title: string;
	artist: string;
	album: string;
	youtubeVideoId: string;
	spotify: string;
	genre: string[];
	released: string;
	processedLyrics: ISentence[];
}

const SongPage = ({id}: {id: string}) => {
	const [songData, setSongData] = useState<ISongData | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(`http://localhost:3000/songs/${id}`);
				if (!response.ok) {
					// TODO: extract hardcoded message
					throw new Error('Failed to fetch data');
				}
				const jsonData = await response.json();
				setSongData(jsonData);
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
