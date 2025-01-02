import {Text} from 'react-native-paper';
import {useTheme} from 'react-native-paper';
import type {TextProps} from 'react-native-paper';

export type ThemedTextProps = TextProps<any> & {
	type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
	type = 'default',
	style,
	children,
	...rest
}: ThemedTextProps) {
	const theme = useTheme();

	const getVariant = () => {
		switch (type) {
			case 'title':
				return 'headlineLarge';
			case 'subtitle':
				return 'headlineSmall';
			case 'defaultSemiBold':
				return 'bodyLarge';
			case 'link':
				return 'bodyLarge';
			default:
				return 'bodyMedium';
		}
	};

	const getStyle = () => {
		if (type === 'link') {
			return {color: theme.colors.primary};
		}
		return {};
	};

	return (
		<Text variant={getVariant()} style={[getStyle(), style]} {...rest}>
			{children}
		</Text>
	);
}
