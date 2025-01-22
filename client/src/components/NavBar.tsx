import {useContext} from 'react';
import {Link} from 'react-router-dom';
import {ThemeContext} from '../context/ThemeContext';
import {LOGO_URLS, TOGGLE_URLS} from './lib/constants';
import {
	NavBarContainer,
	Logo,
	NavLinks,
	StyledLink,
	ThemeToggle,
} from '../styles/NavBar.styles';

const NavBar = () => {
	const {toggleTheme, isDarkMode} = useContext(ThemeContext);

	const logoSrc = isDarkMode ? LOGO_URLS.DARK : LOGO_URLS.LIGHT;
	const toggleSrc = isDarkMode ? TOGGLE_URLS.DARK : TOGGLE_URLS.LIGHT;

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
