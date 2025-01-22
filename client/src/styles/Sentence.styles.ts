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
