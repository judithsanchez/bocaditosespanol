import {useState} from 'react';
import axios from 'axios';
import {TextProcessor} from '../../../src/utils/TextProcessor'; // TODO: find out how to use @ while being able to test and use the debugger

const Admin = () => {
	const [formData, setFormData] = useState({
		title: '',
		artist: '',
		album: '',
		youtubeVideoId: '',
		spotify: '',
		genre: [],
		released: '',
		lyrics: '',
		processedLyrics: null,
	});

	const handleChange = e => {
		const {name, value} = e.target;
		setFormData(prevData => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleGenreChange = e => {
		const {value, checked} = e.target;
		setFormData(prevData => ({
			...prevData,
			genre: checked
				? [...prevData.genre, value]
				: prevData.genre.filter(genre => genre !== value),
		}));
	};

	const handleSubmit = async e => {
		e.preventDefault();
		try {
			const processedLyrics = await new TextProcessor().ProcessTextData(
				formData.lyrics,
			);
			const songData = {...formData, processedLyrics};

			const response = await axios.post(
				'http://localhost:3000/songs',
				songData,
			);
			console.log('Song added:', response.data);
			// Reset the form or perform any other actions after successful submission
		} catch (error) {
			console.error('Error adding song:', error);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div>
				<label htmlFor="title">Title:</label>
				<input
					type="text"
					id="title"
					name="title"
					value={formData.title}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label htmlFor="artist">Artist:</label>
				<input
					type="text"
					id="artist"
					name="artist"
					value={formData.artist}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label htmlFor="album">Album:</label>
				<input
					type="text"
					id="album"
					name="album"
					value={formData.album}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label htmlFor="youtubeVideoId">YouTube Video:</label>
				<input
					type="text"
					id="youtubeVideoId"
					name="youtubeVideoId"
					value={formData.youtubeVideoId}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label htmlFor="spotify">Spotify:</label>
				<input
					type="text"
					id="spotify"
					name="spotify"
					value={formData.spotify}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label>Genre:</label>
				<div>
					<label>
						<input
							type="checkbox"
							value="Latin Pop"
							checked={formData.genre.includes('Latin Pop')}
							onChange={handleGenreChange}
						/>
						Latin Pop
					</label>
					<label>
						<input
							type="checkbox"
							value="Rock en Español"
							checked={formData.genre.includes('Rock en Español')}
							onChange={handleGenreChange}
						/>
						Rock en Español
					</label>
				</div>
			</div>
			<div>
				<label htmlFor="released">Released:</label>
				<input
					type="text"
					id="released"
					name="released"
					value={formData.released}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label htmlFor="lyrics">Lyrics:</label>
				<textarea
					id="lyrics"
					name="lyrics"
					value={formData.lyrics}
					onChange={handleChange}
				/>
			</div>
			<button type="submit">Submit</button>
		</form>
	);
};

export default Admin;
