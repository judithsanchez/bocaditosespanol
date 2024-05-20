/**
 * Renders a page that displays the details of a song.
 *
 * @param {object} props - The component props.
 * @param {string} props.id - The ID of the song to display.
 * @returns {JSX.Element} - The rendered SongPage component.
 */
import {useState, useEffect} from 'react';
import TextAndTranslation from '../components/TextAndTranslation';

// TODO: extract hardcoded strings and api routes

const SongPage = ({id}: {id: string}) => {
	const [songData, setSongData] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(`http://localhost:3000/songs/${id}`);
				if (!response.ok) {
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
		<>
			<TextAndTranslation songData={songData} />
		</>
	);
};

export default SongPage;
