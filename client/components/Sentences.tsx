import {View, StyleSheet, Platform} from 'react-native';
import {Surface, Text, useTheme, Button} from 'react-native-paper';
import {useEffect, useState} from 'react';

type Token = {
	content: string;
	tokenType: string;
	partOfSpeech?: string;
	translations?: {
		english: string[];
	};
};

type Sentence = {
	sentenceId: string;
	content: string;
	translations: {
		english: {
			literal: string;
			contextual: string;
		};
	};
	tokenIds: string[];
	tokens: Token[];
};

type SentencesProps = {
	songId: string;
};

export function Sentences({songId}: SentencesProps) {
	const theme = useTheme();
	const [sentences, setSentences] = useState<Sentence[]>([]);
	const [showContextual, setShowContextual] = useState(false);
	const [showLiteral, setShowLiteral] = useState(false);
	const [showTokens, setShowTokens] = useState(false);

	useEffect(() => {
		fetch(`http://localhost:3000/songs/${songId}`)
			.then(response => response.json())
			.then(data => setSentences(data));
	}, [songId]);

	return (
		<View
			style={[styles.container, Platform.OS === 'web' && styles.webContainer]}
		>
			<View style={styles.buttonContainer}>
				<Button
					mode={showContextual ? 'contained' : 'outlined'}
					onPress={() => setShowContextual(!showContextual)}
					style={styles.toggleButton}
				>
					Contextual Translation
				</Button>
				<Button
					mode={showLiteral ? 'contained' : 'outlined'}
					onPress={() => setShowLiteral(!showLiteral)}
					style={styles.toggleButton}
				>
					Literal Translation
				</Button>
				<Button
					mode={showTokens ? 'contained' : 'outlined'}
					onPress={() => setShowTokens(!showTokens)}
					style={styles.toggleButton}
				>
					Tokens
				</Button>
			</View>

			{sentences.map((sentence, index) => (
				<Surface
					key={`sentence-${index}`}
					style={[
						styles.sentenceContainer,
						{backgroundColor: theme.colors.surface},
					]}
					elevation={1}
				>
					<Text style={[styles.spanish, {color: theme.colors.onSurface}]}>
						{sentence.content}
					</Text>

					{showContextual && (
						<Text style={[styles.translation, {color: theme.colors.onSurface}]}>
							{sentence.translations.english.contextual}
						</Text>
					)}

					{showLiteral && (
						<Text style={[styles.translation, {color: theme.colors.onSurface}]}>
							{sentence.translations.english.literal}
						</Text>
					)}

					{showTokens && (
						<View style={styles.tokensContainer}>
							{sentence.tokens?.map(
								(token, tokenIndex) =>
									token && (
										<Text
											key={`token-${tokenIndex}`}
											style={[
												styles.token,
												{color: theme.colors.onSurface},
												token.partOfSpeech === 'verb' && {
													backgroundImage: `linear-gradient(120deg, ${theme.colors.secondary}80 0%, ${theme.colors.secondary}80 100%)`,
													backgroundRepeat: 'no-repeat',
													backgroundSize: '100% 50%',
													backgroundPosition: '0 120%',
													cursor: 'pointer',
												},
											]}
										>
											{token.content}
										</Text>
									),
							)}
						</View>
					)}
				</Surface>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		gap: 16,
	},
	webContainer: {
		maxWidth: 800,
		alignSelf: 'center',
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
		marginBottom: 16,
	},
	toggleButton: {
		flex: 1,
	},
	sentenceContainer: {
		padding: 16,
		borderRadius: 8,
		gap: 8,
	},
	spanish: {
		fontSize: 18,
		fontWeight: '500',
	},
	translation: {
		fontSize: 16,
	},
	tokensContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 4,
		marginTop: 8,
	},
	token: {
		fontSize: 14,
		fontStyle: 'italic',
	},
});
