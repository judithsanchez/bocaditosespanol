import styled from 'styled-components';

export const BaseToken = styled.span<{
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

export const StyledWord = styled(BaseToken)`
	font-style: italic;
`;

export const StyledEmoji = styled(BaseToken)`
	font-style: normal;
	font-size: 1.6rem;
`;

export const StyledPunctuationLeft = styled(BaseToken)`
	font-style: normal;
	color: ${props => props.theme.colors.text}40;
	margin-left: -0.3rem;
	padding-right: 0.5rem;
`;

export const StyledPunctuationRight = styled(BaseToken)`
	font-style: normal;
	color: ${props => props.theme.colors.text}40;
	margin-right: -0.5rem;
	padding-left: 0.5rem;
`;
