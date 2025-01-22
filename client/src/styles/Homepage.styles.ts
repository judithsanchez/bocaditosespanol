import styled from 'styled-components';

export const HomeContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 80vh;
	gap: 2rem;
`;

export const Title = styled.h1`
	font-size: 2rem;
	color: ${props => props.theme.colors.onBackground};
	margin: 0;
`;

export const LearnImage = styled.img`
	max-width: 200px;
	height: auto;
`;

export const Tagline = styled.h2`
	font-size: 2rem;
	color: ${props => props.theme.colors.onBackground};
	margin: 0;
	text-align: center;
`;
