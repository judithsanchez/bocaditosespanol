/**
 * Renders a page that displays the details of a song.
 *
 * @param {object} props - The component props.
 * @param {string} props.id - The ID of the song to display.
 * @returns {JSX.Element} - The rendered SongPage component.
 */
import {useState, useEffect, useContext} from 'react';
import TextAndTranslation from '../components/TextAndTranslation';
import YoutubePlayer from '../components/YoutubePlayer';
import styles from './styles/Song.module.css';
import {ISongData} from './lib/types';
import SongActivitySelector from '../components/SongActivitySelector';
import {SongContext} from '../context/SongContext';

// TODO: extract hardcoded strings and api routes

const SongPage = ({id}: {id: string}) => {
	const [songData, setSongData] = useState<ISongData | null>(null);
	const {activity, setActivity} = useContext(SongContext);

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
			<SongActivitySelector />
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
