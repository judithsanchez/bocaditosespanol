import { TokenComponentProps } from '../../types/token.types';
import { 
    BaseToken,
    StyledWord,
    StyledEmoji,
    StyledPunctuationLeft,
    StyledPunctuationRight 
} from './Token.styles';

export const TokenComponent = ({ token, isSelected, onClick }: TokenComponentProps) => {
    const leftAttachedPunctuation = ['.', ',', '?', '!', ':', ';'];
    const rightAttachedPunctuation = ['¿', '¡'];

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
