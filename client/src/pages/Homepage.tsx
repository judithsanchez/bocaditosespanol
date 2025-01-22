import {
	HomeContainer,
	LearnImage,
	Tagline,
	Title,
} from '../styles/Homepage.styles';

const Homepage = () => {
	return (
		<HomeContainer>
			<Tagline>Learn Spanish in Small Bites!</Tagline>

			<LearnImage
				src="https://cdn.bfldr.com/Z0BJ31FP/at/cpgkv47qntn72pg46kpwvb6h/icon-listening.svg"
				alt="Learn Spanish in Small Bites"
			/>
			<Title>Bocaditos de Español</Title>
		</HomeContainer>
	);
};

export default Homepage;
