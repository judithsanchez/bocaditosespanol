'use client';

import React, {useContext} from 'react';
import Link from 'next/link';
import {ThemeContext} from '@/components/ThemeContext';
import {
	NavBarContainer,
	Logo,
	NavLinks,
	StyledLink,
	ThemeToggle,
} from '@/components/ui/StyledComponents';
import {LOGO_URLS, TOGGLE_URLS} from '@/lib/constants';

const NavBar = () => {
	const {toggleTheme, isDarkMode} = useContext(ThemeContext);

	const logoSrc = isDarkMode ? LOGO_URLS.DARK : LOGO_URLS.LIGHT;
	const toggleSrc = isDarkMode ? TOGGLE_URLS.DARK : TOGGLE_URLS.LIGHT;

	return (
		<NavBarContainer>
			<Link href="/" passHref>
				<Logo src={logoSrc} alt="Bocaditos - Learn Spanish Logo" />
			</Link>

			<NavLinks>
				<StyledLink href="/songs">Songs</StyledLink>
			</NavLinks>

			<ThemeToggle onClick={toggleTheme} aria-label="Toggle Dark Mode">
				<Logo src={toggleSrc} alt="Dark Mode Toggle Button" />
			</ThemeToggle>
		</NavBarContainer>
	);
};

export default NavBar;
