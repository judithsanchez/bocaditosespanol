export type Token = {
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

export interface TokenComponentProps {
    token: Token;
    isSelected?: boolean;
    onClick?: () => void;
}
