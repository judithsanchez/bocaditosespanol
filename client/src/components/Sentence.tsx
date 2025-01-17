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

const Container = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
`;

const SentenceCard = styled.div`
	width: 350px;
	height: 150px;
	background-color: ${props => props.theme.colors.surface};
	border-radius: 8px;
	box-shadow: 2px 6px 7px rgba(0, 0, 0, 0.25);
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;
	padding: 1rem;
	gap: 1.5rem;
`;
const TokensContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	justify-content: center;
	text-align: center;
`;

const Token = styled.span<{
	isVerb?: boolean;
	isSelected?: boolean;
	isCognate?: boolean;
	isFalseCognate?: boolean;
	isSlang?: boolean;
}>`
	font-size: 1.4rem;
	font-family: 'Roboto', sans-serif;
	font-weight: ${props => (props.isSelected ? '900' : '400')};
	font-style: italic;
	color: ${props =>
		props.isSelected ? props.theme.colors.primary : 'inherit'};
	cursor: pointer;
	transition: all 0.2s ease;
	text-decoration: none;

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

	${props =>
		props.isVerb &&
		`
			background-image: linear-gradient(120deg, ${props.theme.colors.secondary}80 0%, ${props.theme.colors.secondary}80 100%);
			background-repeat: no-repeat;
			background-size: 100% 50%;
			background-position: 0 120%;
		`}
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
		<Container>
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
						.map((token, tokenIndex) =>
							token.tokenType === 'word' ? (
								<Token
									key={`token-${tokenIndex}`}
									isSelected={selectedToken?.content === token.content}
									isCognate={token.isCognate}
									isFalseCognate={token.isFalseCognate}
									isSlang={token.isSlang}
									onClick={() => handleTokenClick(token)}
								>
									{token.content.toLowerCase()}
								</Token>
							) : (
								<Token key={`token-${tokenIndex}`}>{token.content}</Token>
							),
						)}
				</TokensContainer>
				<Translation>
					{sentence.translations.english.contextual
						.toLowerCase()
						.replace(/\.$/, '')}
				</Translation>
			</SentenceCard>
		</Container>
	);
};

export default Sentence;
