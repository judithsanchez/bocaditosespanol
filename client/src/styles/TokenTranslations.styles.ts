import styled from 'styled-components';

export const StyledTokensTranslations = styled.div`
	min-height: 0.2rem;
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
