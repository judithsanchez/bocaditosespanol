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
	ButtonFeedbackContainer,
} from '../styles/Sentence.styles';
import {ISentence, LearningMode} from '@bocaditosespanol/shared';

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
		const normalizeString = (str: string) => {
			return str
				.toLowerCase()
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.replace(/[¿¡.,!?""'']/g, '')
				.replace(/\s+/g, ' ')
				.trim();
		};

		const normalizedInput = normalizeString(userInput);
		const normalizedCorrect = normalizeString(sentence.content);

		const isAnswerCorrect = normalizedInput === normalizedCorrect;
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
						<Translation></Translation>
					</>
				);

			case LearningMode.LISTENING_PRACTICE:
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
};
export default Sentence;
