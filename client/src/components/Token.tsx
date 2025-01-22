import {
	BaseToken,
	StyledWord,
	StyledEmoji,
	StyledPunctuationLeft,
	StyledPunctuationRight,
} from '../styles/Token.styles';
import {TokenComponentProps} from '../types/Token.types';

export const TokenComponent = ({
	token,
	isSelected,
	onClick,
}: TokenComponentProps) => {
	const leftAttachedPunctuation = ['.', ',', '?', '!', ':', ';'];
	const rightAttachedPunctuation = ['¿', '¡'];

	const handleClick = () => {
		if (token.tokenType !== 'punctuationSign') {
			if (onClick) {
				onClick();
			}
		}
	};

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
			isPunctuation={token.tokenType === 'punctuationSign'}
			onClick={handleClick}
		>
			{token.content.toLowerCase()}
		</TokenElement>
	);
};
