import {z} from 'zod';
import {
	BaseToken,
	StyledWord,
	StyledEmoji,
	StyledPunctuationLeft,
	StyledPunctuationRight,
} from '@/components/ui/StyledComponents';
import {TokenType, Token} from '@/lib/types/token';

export interface TokenComponentProps {
	token: Token;
	isSelected?: boolean;
	onClick?: (event: React.MouseEvent) => void;
}

export interface TokensTranslationsProps {
	selectedToken: Token | null;
}

export const TokenComponent = ({
	token,
	isSelected,
	onClick,
}: TokenComponentProps) => {
	type LeftPunctuationMark = '.' | ',' | '?' | '!' | ':' | ';';
	type RightPunctuationMark = '¿' | '¡';

	const leftAttachedPunctuation: readonly LeftPunctuationMark[] = [
		'.',
		',',
		'?',
		'!',
		':',
		';',
	];
	const rightAttachedPunctuation: readonly RightPunctuationMark[] = ['¿', '¡'];

	const handleClick = (e: React.MouseEvent) => {
		// Only handle clicks for word tokens
		if (token.tokenType === TokenType.Word && onClick) {
			e.stopPropagation(); // Prevent event bubbling
			onClick(e);
		}
	};

	const getTokenStyle = () => {
		switch (token.tokenType) {
			case TokenType.Word:
				return StyledWord;
			case TokenType.Emoji:
				return StyledEmoji;
			case TokenType.PunctuationSign:
				if (
					leftAttachedPunctuation.includes(token.content as LeftPunctuationMark)
				) {
					return StyledPunctuationLeft;
				}
				if (
					rightAttachedPunctuation.includes(
						token.content as RightPunctuationMark,
					)
				) {
					return StyledPunctuationRight;
				}
				return BaseToken;
			default:
				return StyledWord;
		}
	};

	const TokenElement = getTokenStyle();

	// Only word tokens have these properties
	const isWordToken = token.tokenType === TokenType.Word;

	return (
		<TokenElement
			isSelected={isSelected}
			isCognate={isWordToken ? token.isCognate : false}
			isFalseCognate={isWordToken ? token.isFalseCognate : false}
			isSlang={isWordToken ? token.isSlang : false}
			isPunctuation={token.tokenType === TokenType.PunctuationSign}
			onClick={handleClick}
		>
			{token.content.toLowerCase()}
		</TokenElement>
	);
};
