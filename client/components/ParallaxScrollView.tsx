import type {PropsWithChildren, ReactElement} from 'react';
import {StyleSheet} from 'react-native';
import {Surface, useTheme} from 'react-native-paper';
import Animated, {
	interpolate,
	useAnimatedRef,
	useAnimatedStyle,
	useScrollViewOffset,
} from 'react-native-reanimated';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{}>;

export default function ParallaxScrollView({children}: Props) {
	const theme = useTheme();
	const scrollRef = useAnimatedRef<Animated.ScrollView>();
	const scrollOffset = useScrollViewOffset(scrollRef);

	const headerAnimatedStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateY: interpolate(
					scrollOffset.value,
					[-HEADER_HEIGHT, 0, HEADER_HEIGHT],
					[-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
				),
			},
			{
				scale: interpolate(
					scrollOffset.value,
					[-HEADER_HEIGHT, 0, HEADER_HEIGHT],
					[2, 1, 1],
				),
			},
		],
	}));

	return (
		<Surface style={styles.container}>
			<Animated.ScrollView
				ref={scrollRef}
				scrollEventThrottle={16}
				contentContainerStyle={styles.scrollContent}
			>
				<Animated.View
					style={[
						styles.header,
						{backgroundColor: theme.colors.surface},
						headerAnimatedStyle,
					]}
				></Animated.View>
				<Surface
					style={[styles.content, {backgroundColor: theme.colors.background}]}
				>
					{children}
				</Surface>
			</Animated.ScrollView>
		</Surface>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
	},
	header: {
		height: HEADER_HEIGHT,
		overflow: 'hidden',
	},
	content: {
		flex: 1,
		padding: 32,
		gap: 16,
		overflow: 'hidden',
	},
});
