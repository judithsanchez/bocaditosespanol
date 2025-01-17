import styled from 'styled-components';

const HomeContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 80vh;
`;

const Title = styled.h1`
	font-size: 3rem;
	color: ${props => props.theme.colors.onBackground};
`;

const Homepage = () => {
	return (
		<HomeContainer>
			<Title>Bocaditos</Title>
		</HomeContainer>
	);
};

export default Homepage;
