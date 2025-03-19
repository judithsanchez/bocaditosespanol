'use client';

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {
	SongSelectorContainer,
	SearchInput,
	SongListContainer,
	SongButton,
} from '@/components/ui/StyledComponents';
import {ISong} from '@/lib';

export default function SongSelector() {
	const [songs, setSongs] = useState<ISong[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		setIsLoading(true);

		fetch('/api/songs')
			.then(res => {
				if (!res.ok) {
					throw new Error('Failed to fetch songs');
				}
				return res.json();
			})
			.then(data => {
				setSongs(data);
				setIsLoading(false);
			})
			.catch(error => {
				console.error('Error fetching songs:', error);
				setIsLoading(false);
			});
	}, []);

	const fetchSongDetails = async (song: ISong) => {
		try {
			const songResponse = await fetch(`/api/songs/${song.songId}`);
			if (!songResponse.ok) {
				throw new Error('Failed to fetch song details');
			}

			const songData = await songResponse.json();

			// Store the song data in localStorage before navigation
			localStorage.setItem(`song_${song.songId}`, JSON.stringify(songData));

			// Navigate to the song detail page
			router.push(`/songs/${song.songId}`);
		} catch (error) {
			console.error('Error fetching song details:', error);
		}
	};

	const handleSongSelect = (song: ISong) => {
		fetchSongDetails(song);
	};

	const filteredSongs = songs.filter(song => {
		const searchTermLower = searchTerm.toLowerCase();
		return (
			song.metadata.title.toLowerCase().includes(searchTermLower) ||
			song.metadata.interpreter.toLowerCase().includes(searchTermLower)
		);
	});

	return (
		<SongSelectorContainer>
			<SearchInput
				type="text"
				placeholder="Search by title or interpreter..."
				value={searchTerm}
				onChange={e => setSearchTerm(e.target.value)}
			/>
			<SongListContainer>
				{isLoading ? (
					<p>Loading songs...</p>
				) : filteredSongs.length > 0 ? (
					filteredSongs.map(song => (
						<SongButton
							key={song.songId}
							onClick={() => handleSongSelect(song)}
						>
							{song.metadata.title} - {song.metadata.interpreter}
						</SongButton>
					))
				) : (
					<p>No songs found matching your search.</p>
				)}
			</SongListContainer>
		</SongSelectorContainer>
	);
}
