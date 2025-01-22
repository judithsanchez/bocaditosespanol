import styled from 'styled-components';

export const SentenceCard = styled.div`
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

export const TokensContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	justify-content: center;
	text-align: center;
`;

export const Translation = styled.p`
	font-size: 12px;
	color: ${props => props.theme.colors.text}80;
	font-style: italic;
	text-align: center;
`;

export const WritingContainer = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	align-items: center;
`;

export const Input = styled.input`
	width: 100%;
	padding: 0.8rem;
	border-radius: 4px;
	border: 1px solid ${props => props.theme.colors.border};
	background: ${props => props.theme.colors.background};
	color: ${props => props.theme.colors.text};
`;

export const SubmitButton = styled.button`
	padding: 0.5rem 2rem;
	border-radius: 4px;
	border: none;
	background: ${props => props.theme.colors.primary};
	color: white;
	cursor: pointer;
`;

export const FeedbackIcon = styled.div`
	font-size: 2rem;
`;
