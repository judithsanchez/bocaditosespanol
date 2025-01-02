import {StyleSheet, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import {ThemedButton} from '@/components/ThemedButton';

export default function HomeScreen() {
	const theme = useTheme();
	return (
		<ParallaxScrollView>
			<View
				style={[
					styles.titleContainer,
					{backgroundColor: theme.colors.background},
				]}
			>
				<ThemedButton />
				<Text variant="headlineLarge">Welcome ISABELLA!</Text>
			</View>
		</ParallaxScrollView>
	);
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		padding: 16,
		elevation: 0,
	},
	reactLogo: {
		height: 178,
		width: 290,
		bottom: 0,
		left: 0,
		position: 'absolute',
	},
});
