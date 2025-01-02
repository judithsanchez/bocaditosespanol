import {Surface} from 'react-native-paper';
import type {ViewProps} from 'react-native';

export type ThemedViewProps = ViewProps & {
	elevation?: number;
};

export function ThemedView({
	style,
	elevation = 0,
	children,
	...rest
}: ThemedViewProps) {
	return (
		<Surface
			elevation={elevation as 0 | 1 | 2 | 3 | 4 | 5}
			style={[{padding: 16}, style]}
			{...rest}
		>
			{children}
		</Surface>
	);
}
