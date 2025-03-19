import {useState} from 'react';
import {ISentence, LearningMode, Token, WordToken} from '@/lib/types/common';
import {
	SentenceCard,
	TokensContainer,
	Translation,
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
	const [selectedToken, setSelectedToken] = useState<Token | null>(null);
	const [userInput, setUserInput] = useState('');
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
	const [showOriginal, setShowOriginal] = useState(
		mode !== LearningMode.LISTENING_PRACTICE,
	);

	const handleTokenClick = (token: Token) => {
		if (selectedToken?.tokenId === token.tokenId) {
			setSelectedToken(null);
		} else {
			setSelectedToken(token);
		}
	};

	const toggleOriginal = () => {
		if (mode === LearningMode.LISTENING_PRACTICE) {
			setShowOriginal(!showOriginal);
		}
	};

	const normalizeString = (str: string) => {
		return str
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '') // Remove diacritics
			.replace(/[¿¡.,!?""'']/g, '') // Remove punctuation
			.replace(/\s+/g, ' ') // Normalize whitespace
			.trim();
	};

	const handleSubmit = () => {
		const normalizedInput = normalizeString(userInput);
		const normalizedCorrect = normalizeString(sentence.content);
		const isAnswerCorrect = normalizedInput === normalizedCorrect;
		setIsCorrect(isAnswerCorrect);
	};

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
		displayTokens.pop();
	}

	const renderContent = () => {
		switch (mode) {
			case LearningMode.DEFAULT:
				return (
					<>
						<TokensTranslations selectedToken={selectedToken as WordToken} />
						<TokensContainer>
							{displayTokens.map((token, index) => (
								<TokenComponent
									key={`token-${index}`}
									token={token}
									isSelected={selectedToken?.tokenId === token.tokenId}
									onClick={() => handleTokenClick(token)}
								/>
							))}
						</TokensContainer>
						<Translation>
							{sentence.translations.english.contextual}
						</Translation>
					</>
				);

			case LearningMode.HIDE_TRANSLATIONS:
				return (
					<>
						<TokensTranslations selectedToken={selectedToken as WordToken} />
						<TokensContainer>
							{displayTokens.map((token, index) => (
								<TokenComponent
									key={`token-${index}`}
									token={token}
									isSelected={selectedToken?.tokenId === token.tokenId}
									onClick={() => handleTokenClick(token)}
								/>
							))}
						</TokensContainer>
					</>
				);

			case LearningMode.LISTENING_PRACTICE:
				return showOriginal ? (
					<>
						<TokensContainer>
							{displayTokens.map((token, index) => (
								<TokenComponent key={`token-${index}`} token={token} />
							))}
						</TokensContainer>
						<Translation>
							{sentence.translations.english.contextual}
						</Translation>
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
					</>
				) : (
					<>
						<Translation onClick={toggleOriginal}>
							{sentence.translations.english.contextual}
							<p>[Click to reveal text]</p>
						</Translation>
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
					</>
				);
		}
	};

	return <SentenceCard>{renderContent()}</SentenceCard>;
}
