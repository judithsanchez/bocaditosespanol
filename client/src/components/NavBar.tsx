import {useContext} from 'react';
import {Link} from 'react-router-dom';
import styled from 'styled-components';
import {ThemeContext} from '../context/ThemeContext';

const NavBarContainer = styled.header`
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: ${props => props.theme.colors.navbar};
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	height: 4rem;
	padding: 0 2rem;
	position: sticky;
	top: 0;
	z-index: 1;
`;
const Logo = styled.img`
	height: 2.5rem;
	width: 2.5rem;
	cursor: pointer;
`;

const NavLinks = styled.nav`
	display: flex;
	gap: 2rem;
`;

const StyledLink = styled(Link)`
	color: ${props => props.theme.colors.onSurface};
	text-decoration: none;
	font-size: 1.1rem;

	&:hover {
		color: ${props => props.theme.colors.primary};
	}
`;

const ThemeToggle = styled.button`
	background-color: transparent;
	border: none;
	height: 2.5rem;
	width: 2.5rem;
	padding: 0;
	cursor: pointer;
`;

const NavBar = () => {
	const {toggleTheme, isDarkMode} = useContext(ThemeContext);

	const logoSrc = isDarkMode
		? 'https://cdn.bfldr.com/Z0BJ31FP/at/7bq35cg9mzk7bngwjnt645w/logo-main-white.svg'
		: 'https://cdn.bfldr.com/Z0BJ31FP/at/ggx73vmcsmrspvt9fb8wg5kc/logo-main-grey.svg';

	const toggleSrc = isDarkMode
		? 'https://cdn.bfldr.com/Z0BJ31FP/at/k87sm4jtprcnv89f7fq4nqv/button-to-light-mode.svg'
		: 'https://cdn.bfldr.com/Z0BJ31FP/at/r9vn7sx7x3mg5tww6gshsvt/button-to-dark-mode.svg';

	return (
		<NavBarContainer>
			<Link to="/">
				<Logo src={logoSrc} alt="Bocaditos - Learn Spanish Logo" />
			</Link>

			<NavLinks>
				<StyledLink to="/songs">Songs</StyledLink>
			</NavLinks>

			<ThemeToggle onClick={toggleTheme} aria-label="Toggle Dark Mode">
				<Logo src={toggleSrc} alt="Dark Mode Toggle Button" />
			</ThemeToggle>
		</NavBarContainer>
	);
};

export default NavBar;
