/* eslint-disable */
// @ts-nocheck

import {useState} from 'react';
import {Token} from '../types/Token.types';
import {TokensTranslations} from './TokensTranslations';
import {TokenComponent} from './Token';
import {
	SentenceCard,
	TokensContainer,
	Translation,
	WritingContainer,
	Input,
	SubmitButton,
	FeedbackIcon,
} from '../styles/Sentence.styles';
import {ISentence, LearningMode} from '../types/SelectedSong.types';

const Sentence = ({
	sentence,
	mode,
}: {
	sentence: ISentence;
	mode: LearningMode;
}) => {
	const [selectedToken, setSelectedToken] = useState<Token | null>(null);
	const [userInput, setUserInput] = useState('');
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

	const handleTokenClick = (token: Token) => {
		if (selectedToken?.content === token.content) {
			setSelectedToken(null);
		} else {
			setSelectedToken(token);
		}
	};

	const handleSubmit = () => {
		const isAnswerCorrect =
			userInput.trim().toLowerCase() === sentence.content.toLowerCase();
		setIsCorrect(isAnswerCorrect);
	};

	const renderContent = () => {
		switch (mode) {
			case LearningMode.DEFAULT:
				return (
					<>
						<TokensTranslations selectedToken={selectedToken} />
						<TokensContainer>
							{sentence?.tokens?.map((token, tokenIndex) => {
								if (
									token.content === '.' &&
									tokenIndex === sentence.tokens.length - 1
								)
									return null;
								return (
									<TokenComponent
										key={`token-${tokenIndex}`}
										token={token}
										isSelected={selectedToken?.content === token.content}
										onClick={() => handleTokenClick(token)}
									/>
								);
							})}
						</TokensContainer>
						<Translation>
							{sentence.translations.english.contextual}
						</Translation>
					</>
				);

			case LearningMode.HIDE_TRANSLATIONS:
				return (
					<>
						<TokensTranslations selectedToken={selectedToken} />
						<TokensContainer>
							{sentence?.tokens?.map((token, tokenIndex) => {
								if (
									token.content === '.' &&
									tokenIndex === sentence.tokens.length - 1
								)
									return null;
								return (
									<TokenComponent
										key={`token-${tokenIndex}`}
										token={token}
										isSelected={selectedToken?.content === token.content}
										onClick={() => handleTokenClick(token)}
									/>
								);
							})}
						</TokensContainer>
						<Translation>
							{/* Empty translation container to maintain spacing */}
						</Translation>
					</>
				);

			case LearningMode.WRITING_PRACTICE:
				return (
					<>
						<Translation>
							{sentence.translations.english.contextual}
						</Translation>
						<WritingContainer>
							<Input
								value={userInput}
								onChange={e => setUserInput(e.target.value)}
								placeholder="Type the Spanish sentence..."
							/>
							<SubmitButton onClick={handleSubmit}>Check</SubmitButton>
							{isCorrect !== null && (
								<FeedbackIcon>{isCorrect ? '👍' : '👎'}</FeedbackIcon>
							)}
						</WritingContainer>
					</>
				);
		}
	};

	return <SentenceCard>{renderContent()}</SentenceCard>;
};
export default Sentence;
