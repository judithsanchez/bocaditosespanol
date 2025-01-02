import React, {useState} from 'react';
import {Surface, Text, useTheme} from 'react-native-paper';
import {StyleSheet, Pressable, Platform, View} from 'react-native';
import Animated, {
	withSpring,
	useAnimatedStyle,
	withTiming,
} from 'react-native-reanimated';
import type {ISentence, IToken} from '../../lib/types';

interface TooltipSurfaceProps {
	children: React.ReactNode;
	tooltipContent: string;
	style?: object;
}

export const TooltipSurface = ({
	children,
	tooltipContent,
	style,
}: TooltipSurfaceProps) => {
	const [showTooltip, setShowTooltip] = useState(false);
	const theme = useTheme();

	const tooltipStyle = useAnimatedStyle(() => ({
		opacity: withTiming(showTooltip ? 1 : 0),
		transform: [
			{
				scale: withSpring(showTooltip ? 1 : 0.8),
			},
		],
	}));

	const handleInteraction = () => {
		setShowTooltip(!showTooltip);
	};

	return (
		<Pressable
			onPress={Platform.OS !== 'web' ? handleInteraction : undefined}
			onHoverIn={Platform.OS === 'web' ? () => setShowTooltip(true) : undefined}
			onHoverOut={
				Platform.OS === 'web' ? () => setShowTooltip(false) : undefined
			}
		>
			<Surface style={[styles.surface, style]}>
				{children}
				<Animated.View
					style={[
						styles.tooltip,
						tooltipStyle,
						{backgroundColor: theme.colors.surface},
					]}
				>
					<Text style={[styles.tooltipText, {color: theme.colors.onSurface}]}>
						{tooltipContent}
					</Text>
				</Animated.View>
			</Surface>
		</Pressable>
	);
};

type SentencesProps = {
	data: ISentence[];
};

const TokenComponent = ({token}: {token: IToken}) => {
	const theme = useTheme();
	const spanishWord =
		typeof token.token === 'string' ? token.token : token.token.spanish;
	const englishTranslation =
		typeof token.token === 'string' ? '' : token.token.english;

	return (
		<TooltipSurface tooltipContent={englishTranslation || ''}>
			<Text style={[styles.token, {color: theme.colors.onSurface}]}>
				{spanishWord}
			</Text>
		</TooltipSurface>
	);
};

export function Sentences({data}: SentencesProps) {
	const theme = useTheme();

	return (
		<View style={styles.container}>
			{data.map((sentence, index) => (
				<Surface
					key={index}
					style={[
						styles.sentenceContainer,
						{backgroundColor: theme.colors.surface},
					]}
					elevation={1}
				>
					<View style={styles.tokensContainer}>
						{sentence.tokens.map((token, tokenIndex) => (
							<TokenComponent key={tokenIndex} token={token} />
						))}
					</View>
					<Text variant="bodyMedium" style={{color: theme.colors.primary}}>
						{sentence.translation}
					</Text>
				</Surface>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	surface: {
		padding: 8, // Reduced padding
		borderRadius: 8,
		position: 'relative',
		zIndex: 1, // Base layer
	},
	tooltip: {
		position: 'absolute',
		padding: 8,
		borderRadius: 4,
		bottom: '100%', // Changed from 'top' to 'bottom' to position above
		left: '50%',
		transform: [{translateX: -50}],
		marginBottom: 4, // Reduced marginBottom
		zIndex: 9999,
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		alignSelf: 'flex-start', // Adjust size to content
		flexDirection: 'row', // Prevent text wrapping
		flexWrap: 'nowrap', // Prevent text wrapping
	},
	tooltipText: {
		fontSize: 12,
	},
	container: {
		gap: 16,
		padding: 16,
	},
	sentenceContainer: {
		padding: 16,
		borderRadius: 8,
	},
	tokensContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 4,
		marginBottom: 8,
	},
	token: {
		fontSize: 16,
	},
});
