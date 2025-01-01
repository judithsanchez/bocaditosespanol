import {Image, StyleSheet, Platform, View} from 'react-native';
import {useSongs} from '@/hooks/useSongs';
import {HelloWave} from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';

const SongCard = ({
	song,
}: {
	song: {
		metadata: {
			songName: string;
			interpreter: string;
			feat?: string;
			genre: string;
		};
	};
}) => (
	<ThemedView style={styles.songCard}>
		<ThemedText type="subtitle">{song.metadata.songName}</ThemedText>
		<ThemedText>{song.metadata.interpreter}</ThemedText>
		{song.metadata.feat && <ThemedText>feat. {song.metadata.feat}</ThemedText>}
		<ThemedText>{song.metadata.genre}</ThemedText>
	</ThemedView>
);

export default function HomeScreen() {
	const {songs, loading, error} = useSongs();

	return (
		<ParallaxScrollView
			headerBackgroundColor={{light: '#A1CEDC', dark: '#1D3D47'}}
			headerImage={
				<Image
					source={require('@/assets/images/partial-react-logo.png')}
					style={styles.reactLogo}
				/>
			}
		>
			<ThemedView style={styles.titleContainer}>
				<ThemedText type="title">Welcome ISABELLA!</ThemedText>
				<HelloWave />
			</ThemedView>
			<ThemedView style={styles.stepContainer}>
				<ThemedText type="subtitle">Step 1: Try it</ThemedText>
				<ThemedText>
					Edit{' '}
					<ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{' '}
					to see changes. Press{' '}
					<ThemedText type="defaultSemiBold">
						{Platform.select({
							ios: 'cmd + d',
							android: 'cmd + m',
							web: 'F12',
						})}
					</ThemedText>{' '}
					to open developer tools.
				</ThemedText>
			</ThemedView>
			<ThemedView style={styles.stepContainer}>
				<ThemedText type="subtitle">Step 2: Explore</ThemedText>
				<ThemedText>
					Tap the Explore tab to learn more about what's included in this
					starter app.
				</ThemedText>
			</ThemedView>
			<ThemedView style={styles.stepContainer}>
				<ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
				<ThemedText>
					When you're ready, run{' '}
					<ThemedText type="defaultSemiBold">npm run reset-project</ThemedText>{' '}
					to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText>{' '}
					directory. This will move the current{' '}
					<ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
					<ThemedText type="defaultSemiBold">app-example</ThemedText>.
				</ThemedText>
			</ThemedView>

			<ThemedView style={styles.songsContainer}>
				<ThemedText type="subtitle">Available Songs</ThemedText>
				{loading && <ThemedText>Loading songs...</ThemedText>}
				{error && <ThemedText>Error: {error}</ThemedText>}
				{songs.map(song => (
					<SongCard key={song.songId} song={song} />
				))}
			</ThemedView>
		</ParallaxScrollView>
	);
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	stepContainer: {
		gap: 8,
		marginBottom: 8,
	},
	reactLogo: {
		height: 178,
		width: 290,
		bottom: 0,
		left: 0,
		position: 'absolute',
	},
	songsContainer: {
		gap: 16,
		marginTop: 20,
	},
	songCard: {
		padding: 16,
		borderRadius: 8,
		backgroundColor: 'rgba(161, 206, 220, 0.1)',
		gap: 4,
	},
});
