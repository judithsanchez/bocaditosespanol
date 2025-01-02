import {Image, StyleSheet, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import {ThemedButton} from '@/components/ThemedButton';
import {Sentences} from '@/components/Sentences';
import songData from '@/tempData/buenos-aires-anakena.json';

export default function HomeScreen() {
	const theme = useTheme();

	return (
		<ParallaxScrollView>
			<View
				style={[styles.container, {backgroundColor: theme.colors.background}]}
			>
				{/* Navigation Bar */}
				<View style={styles.navBar}>
					<ThemedButton />
				</View>

				{/* Title Container */}
				<View style={styles.titleContainer}>
					<Text variant="headlineLarge">Buenos Aires</Text>
				</View>

				{/* Sentences Container */}
				<View style={styles.sentencesContainer}>
					<Sentences data={songData.data} />
				</View>
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
	titleContainer: {
		alignItems: 'center',
		marginBottom: 24,
	},
	sentencesContainer: {
		flex: 1,
	},
});
