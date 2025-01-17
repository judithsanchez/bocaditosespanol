import {StyleSheet, View} from 'react-native';
import {Text, useTheme, Button} from 'react-native-paper';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import {ThemedButton} from '@/components/ThemedButton';
import {Sentences} from '@/components/Sentences';
import {useState, useEffect} from 'react';

interface Song {
	songId: string;
	metadata: {
		interpreter: string;
		title: string;
	};
}

export default function HomeScreen() {
	const theme = useTheme();
	const [songs, setSongs] = useState<Song[]>([]);
	const [selectedSongId, setSelectedSongId] = useState<string>('');

	useEffect(() => {
		fetch('http://localhost:3000/songs')
			.then(response => response.json())
			.then(data => setSongs(data));
	}, []);

	return (
		<ParallaxScrollView>
			<Text variant="headlineLarge">
				<span
					style={{
						backgroundImage:
							'linear-gradient(120deg, rgba(255, 214, 0, 0.75) 0%, rgba(255, 214, 0, 0.75) 100%)',
						backgroundRepeat: 'no-repeat',
						backgroundSize: '100% 50%',
						backgroundPosition: '0 120%',
						cursor: 'pointer',
					}}
				>
					WELTiTA
				</span>
			</Text>
			<View
				style={[styles.container, {backgroundColor: theme.colors.background}]}
			>
				<View style={styles.navBar}>
					<ThemedButton />
				</View>
				<View style={styles.songsContainer}>
					{songs.map(song => (
						<Button
							key={song.songId}
							mode="contained"
							onPress={() => setSelectedSongId(song.songId)}
							style={styles.songButton}
						>
							{song.metadata.title}
						</Button>
					))}
				</View>
				{selectedSongId && <Sentences songId={selectedSongId} />}
			</View>
		</ParallaxScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	navBar: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		padding: 16,
	},
	songsContainer: {
		gap: 12,
		padding: 16,
	},
	songButton: {
		marginVertical: 6,
		borderRadius: 8,
	},
});
