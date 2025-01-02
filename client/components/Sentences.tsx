import {View, StyleSheet, Platform} from 'react-native';
import {Surface, Text, useTheme} from 'react-native-paper';
import type {ISentence, IToken} from '../../lib/types';
import {TooltipSurface} from './TooltipSurface';

type SentencesProps = {
	data: ISentence[];
};

const TokenComponent = ({token}: {token: IToken}) => {
	const theme = useTheme();
	const spanishWord =
		typeof token.token === 'string' ? token.token : token.token.spanish;
	const englishTranslation =
		typeof token.token === 'string' ? '' : token.token.english;

	if (token.type === 'word') {
		return (
			<TooltipSurface tooltipContent={englishTranslation || ''}>
				<View style={styles.tokenContainer}>
					<Text style={[styles.token, {color: theme.colors.onSurface}]}>
						{spanishWord}
					</Text>
				</View>
			</TooltipSurface>
		);
	} else {
		return (
			<View style={styles.tokenContainer}>
				<Text style={[styles.token, {color: theme.colors.onSurface}]}>
					{spanishWord}
				</Text>
			</View>
		);
	}
};

export function Sentences({data}: SentencesProps) {
	const theme = useTheme();

	return (
		<View
			style={[styles.container, Platform.OS === 'web' && styles.webContainer]}
		>
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
	container: {
		gap: 16,
		padding: 16,
		flex: 1,
	},
	webContainer: {
		maxWidth: 600, // Limit the width on web
		marginHorizontal: 'auto', // Center horizontally on web
	},
	sentenceContainer: {
		padding: 16,
		borderRadius: 8,
		alignItems: 'center', // Center content horizontally
	},
	tokensContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 4,
		marginBottom: 8,
		justifyContent: 'center', // Center tokens horizontally
		alignItems: 'center', // Center tokens vertically
	},
	tokenContainer: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	token: {
		fontSize: 16,
	},
});
