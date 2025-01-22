import styled from 'styled-components';
import {useState} from 'react';
type Token = {
	content: string;
	tokenType: string;
	partOfSpeech?: string;
	translations?: {
		english: string[];
	};
	isCognate?: boolean;
	isFalseCognate?: boolean;
	isSlang?: boolean;
};

type ISentence = {
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

const SentenceCard = styled.div`
	min-height: 150px;
	width: 350px;
	height: auto;
	background-color: ${props => props.theme.colors.surface};
	border-radius: 8px;
	box-shadow: 2px 6px 7px rgba(0, 0, 0, 0.25);
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;
	padding: 1.5rem;
	gap: 1.5rem;
`;
const TokensContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	justify-content: center;
	text-align: center;
`;

const BaseToken = styled.span<{
	isSelected?: boolean;
	isCognate?: boolean;
	isFalseCognate?: boolean;
	isSlang?: boolean;
}>`
	font-size: 1.4rem;
	font-family: 'Roboto', sans-serif;
	font-weight: ${props => (props.isSelected ? '900' : '400')};
	color: ${props =>
		props.isSelected ? props.theme.colors.primary : 'inherit'};
	cursor: pointer;
	transition: all 0.2s ease;

	${props =>
		props.isCognate &&
		`
		border-bottom: 3px solid ${props.theme.colors.cognate};
	`}

	${props =>
		props.isFalseCognate &&
		`
		border-bottom: 3px solid ${props.theme.colors.falseCognate};
	`}

	${props =>
		props.isSlang &&
		`
		border-bottom: 3px solid ${props.theme.colors.slang};
	`}
`;

const StyledWord = styled(BaseToken)`
	font-style: italic;
`;

const StyledEmoji = styled(BaseToken)`
	font-style: normal;
	font-size: 1.6rem;
`;

const StyledPunctuation = styled(BaseToken)`
	font-style: normal;
	color: ${props => props.theme.colors.text}40;
	margin-left: -0.3rem; // This pulls the punctuation closer to the previous token
	padding-right: 0.5rem; // This maintains spacing with the next token
`;
const Translation = styled.p`
	font-size: 12px;
	color: ${props => props.theme.colors.text}80;
	font-style: italic;
	text-align: center;
`;

const TokensTranslations = styled.div`
	height: 20px;
	width: fit-content;
	margin: 0 auto;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 0.5rem;
	align-items: center;
	justify-content: center;

	p {
		font-size: 14px;
		margin: 0;
		background-color: ${props => props.theme.colors.primary}90;
		border-radius: 5px;
		padding: 2px 8px;
	}
`;

const StyledPunctuationLeft = styled(BaseToken)`
	font-style: normal;
	color: ${props => props.theme.colors.text}40;
	margin-left: -0.3rem;
	padding-right: 0.5rem;
`;

const StyledPunctuationRight = styled(BaseToken)`
	font-style: normal;
	color: ${props => props.theme.colors.text}40;
	margin-right: -0.3rem;
	padding-left: 0.5rem;
`;

const Sentence = ({sentence}: {sentence: ISentence}) => {
	const [selectedToken, setSelectedToken] = useState<Token | null>(null);

	const handleTokenClick = (token: Token) => {
		if (selectedToken?.content === token.content) {
			setSelectedToken(null);
		} else {
			setSelectedToken(token);
		}
	};

	return (
		<SentenceCard>
			<TokensTranslations>
				{selectedToken &&
					selectedToken.translations?.english.map((translation, index) => (
						<p key={`translation-${index}`}>{translation}</p>
					))}
			</TokensTranslations>
			<TokensContainer>
				{sentence?.tokens
					?.filter(token => token !== null && token.content !== '.')
					.map((token, tokenIndex) => (
						<TokenComponent
							key={`token-${tokenIndex}`}
							token={token}
							isSelected={selectedToken?.content === token.content}
							onClick={() => handleTokenClick(token)}
						/>
					))}
			</TokensContainer>
			<Translation>
				{sentence.translations.english.contextual
					.toLowerCase()
					.replace(/\.$/, '')}
			</Translation>
		</SentenceCard>
	);
};
export default Sentence;

const TokenComponent = ({
	token,
	isSelected,
	onClick,
}: {
	token: Token;
	isSelected?: boolean;
	onClick?: () => void;
}) => {
	const leftAttachedPunctuation = ['.', ',', '?'];
	const rightAttachedPunctuation = ['¿'];

	const getTokenStyle = () => {
		switch (token.tokenType) {
			case 'word':
				return StyledWord;
			case 'emoji':
				return StyledEmoji;
			case 'punctuationSign':
				if (leftAttachedPunctuation.includes(token.content)) {
					return StyledPunctuationLeft;
				}
				if (rightAttachedPunctuation.includes(token.content)) {
					return StyledPunctuationRight;
				}
				return BaseToken;
			default:
				return StyledWord;
		}
	};

	const TokenElement = getTokenStyle();

	return (
		<TokenElement
			isSelected={isSelected}
			isCognate={token.isCognate}
			isFalseCognate={token.isFalseCognate}
			isSlang={token.isSlang}
			onClick={onClick}
		>
			{token.content.toLowerCase()}
		</TokenElement>
	);
};
