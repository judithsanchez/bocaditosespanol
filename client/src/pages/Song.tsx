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
			<h1>One song</h1>
			<TextAndTranslation songData={songData} />
		</>
	);
};

export default SongPage;
