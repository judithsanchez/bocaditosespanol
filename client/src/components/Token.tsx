import {z} from 'zod';
import {
	BaseToken,
	StyledWord,
	StyledEmoji,
	StyledPunctuationLeft,
	StyledPunctuationRight,
} from '../styles/Token.styles';
import {TokenType} from '@bocaditosespanol/shared';

const TokenSchema = z.object({
	content: z.string(),
	tokenType: z.nativeEnum(TokenType),
	tokenId: z.string(),
	isCognate: z.boolean().optional(),
	isFalseCognate: z.boolean().optional(),
	isSlang: z.boolean().optional(),
});

export type ValidatedToken = z.infer<typeof TokenSchema>;

export interface TokenComponentProps {
	token: ValidatedToken;
	isSelected?: boolean;
	onClick?: () => void;
}

export interface TokensTranslationsProps {
	selectedToken: ValidatedToken | null;
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

	const handleClick = () => {
		if (token.tokenType !== TokenType.PunctuationSign && onClick) {
			onClick();
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

	const parsedToken = TokenSchema.safeParse(token);
	if (!parsedToken.success) {
		console.error('Invalid token data:', parsedToken.error);
		return null;
	}

	const TokenElement = getTokenStyle();

	return (
		<TokenElement
			isSelected={isSelected}
			isCognate={token.isCognate}
			isFalseCognate={token.isFalseCognate}
			isSlang={token.isSlang}
			isPunctuation={token.tokenType === TokenType.PunctuationSign}
			onClick={handleClick}
		>
			{token.content.toLowerCase()}
		</TokenElement>
	);
};
