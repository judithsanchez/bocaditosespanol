import {useState, useEffect} from 'react';
import {ISentence, LearningMode, Token, WordToken} from '@/lib/types/common';
import {
	SentenceContainer,
	TranslationContainer,
	WritingContainer,
	Input,
	ButtonFeedbackContainer,
	SubmitButton,
	FeedbackIcon,
} from '@/components/ui/StyledComponents';
import {TokenComponent} from './Token';
import {TokensTranslations} from './TokensTranslations';

interface SentenceProps {
	sentence: ISentence;
	mode: LearningMode;
}

export default function Sentence({sentence, mode}: SentenceProps) {
	// Initialize showTranslation based on the mode
	const [showTranslation, setShowTranslation] = useState(
		mode === LearningMode.DEFAULT,
	);
	const [showOriginal, setShowOriginal] = useState(false);
	const [selectedToken, setSelectedToken] = useState<Token | null>(null);

	// States for listening practice mode
	const [userInput, setUserInput] = useState('');
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

	// Update showTranslation when mode changes
	useEffect(() => {
		setShowTranslation(mode === LearningMode.DEFAULT);
	}, [mode]);

	const toggleTranslation = () => {
		if (mode !== LearningMode.HIDE_TRANSLATIONS) {
			setShowTranslation(!showTranslation);
		}
	};

	const toggleOriginal = () => {
		if (mode === LearningMode.LISTENING_PRACTICE) {
			setShowOriginal(!showOriginal);
		}
	};

	const handleTokenClick = (token: Token, event: React.MouseEvent) => {
		// If clicking the same token, toggle it off
		if (selectedToken && selectedToken.tokenId === token.tokenId) {
			setSelectedToken(null);
		} else {
			// Otherwise, select the new token
			setSelectedToken(token);
		}

		// Prevent event propagation to avoid toggling sentence translation
		event.stopPropagation();
	};

	// Normalize Spanish text for comparison
	const normalizeString = (str: string) => {
		return str
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '') // Remove diacritics
			.replace(/[¿¡.,!?""'']/g, '') // Remove punctuation
			.replace(/\s+/g, ' ') // Normalize whitespace
			.trim();
	};

	const removeTrailingPeriod = (text: string): string => {
		if (!text) return '';

		// Check if the string ends with a period but not with ellipsis
		if (text.endsWith('.') && !text.endsWith('...')) {
			return text.slice(0, -1);
		}

		return text;
	};

	// Handle submission in listening practice mode
	const handleSubmit = () => {
		const normalizedInput = normalizeString(userInput);
		const normalizedCorrect = normalizeString(sentence.content);
		const isAnswerCorrect = normalizedInput === normalizedCorrect;
		setIsCorrect(isAnswerCorrect);
	};

	const shouldShowOriginal =
		mode !== LearningMode.LISTENING_PRACTICE || showOriginal;
	const shouldShowTranslation =
		mode !== LearningMode.HIDE_TRANSLATIONS && showTranslation;

	// Render listening practice mode UI
	if (mode === LearningMode.LISTENING_PRACTICE) {
		return (
			<div>
				{shouldShowOriginal ? (
					<>
						<SentenceContainer>
							{sentence.tokens &&
								sentence.tokens.map((token: Token, index: number) => (
									<TokenComponent
										key={`${token.tokenId}-${index}`}
										token={token}
									/>
								))}
						</SentenceContainer>
					</>
				) : (
					<TranslationContainer>
						<p>
							{removeTrailingPeriod(
								sentence.translations?.english?.contextual as string,
							)}
						</p>
					</TranslationContainer>
				)}

				<WritingContainer>
					<Input
						value={userInput}
						onChange={e => setUserInput(e.target.value)}
						placeholder="Type the Spanish sentence..."
					/>
					<ButtonFeedbackContainer>
						<SubmitButton onClick={handleSubmit}>Check</SubmitButton>
						{isCorrect !== null && (
							<FeedbackIcon>{isCorrect ? '👍🏻' : '👎🏻'}</FeedbackIcon>
						)}
					</ButtonFeedbackContainer>
				</WritingContainer>
			</div>
		);
	}
	// Render default or hide translations mode
	// Filter out the final period if it exists
	const displayTokens = sentence.tokens ? [...sentence.tokens] : [];
	if (
		displayTokens.length > 0 &&
		displayTokens[displayTokens.length - 1].content === '.' &&
		!(
			displayTokens.length > 1 &&
			displayTokens[displayTokens.length - 2].content === '.'
		)
	) {
		// Remove only if it's a single period (not part of ellipsis)
		displayTokens.pop();
	}

	return (
		<div>
			{shouldShowOriginal ? (
				<>
					{/* Token translations appear ABOVE the tokens */}
					{selectedToken?.tokenType === 'word' && (
						<TokensTranslations selectedToken={selectedToken as WordToken} />
					)}

					<SentenceContainer onClick={toggleTranslation}>
						{displayTokens.map((token: Token, index: number) => (
							<TokenComponent
								key={`${token.tokenId}-${index}`}
								token={token}
								isSelected={selectedToken?.tokenId === token.tokenId}
								onClick={event => handleTokenClick(token, event)}
							/>
						))}
					</SentenceContainer>

					{/* Sentence translation always shows when appropriate */}
					{shouldShowTranslation && (
						<TranslationContainer>
							<p>{sentence.translations?.english?.contextual}</p>
						</TranslationContainer>
					)}
				</>
			) : (
				<SentenceContainer onClick={toggleOriginal}>
					<p>[Click to reveal text]</p>
				</SentenceContainer>
			)}
		</div>
	);
}
