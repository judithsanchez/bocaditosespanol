import styled from 'styled-components';
import {Link} from 'react-router-dom';

export const NavBarContainer = styled.header`
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: ${props => props.theme.colors.navbar};
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	height: 4rem;
	padding: 0 1rem;
	position: sticky;
	top: 0;
	z-index: 1;

	@media (min-width: 768px) {
		height: 5rem;
		padding: 0 3rem;
	}

	@media (min-width: 1024px) {
		padding: 0 4rem;
	}

	@media (min-width: 1280px) {
		height: 6rem;
		padding: 0 6rem;
	}
`;

export const Logo = styled.img`
	height: 2.5rem;
	width: 2.5rem;
	cursor: pointer;

	@media (min-width: 768px) {
		height: 3rem;
		width: 3rem;
	}

	@media (min-width: 1280px) {
		height: 3.5rem;
		width: 3.5rem;
	}
`;

export const NavLinks = styled.nav`
	display: flex;
	gap: 2rem;

	@media (min-width: 768px) {
		gap: 3rem;
	}

	@media (min-width: 1280px) {
		gap: 4rem;
	}
`;

export const StyledLink = styled(Link)`
	color: ${props => props.theme.colors.onSurface};
	text-decoration: none;
	font-size: 1.1rem;

	@media (min-width: 768px) {
		font-size: 1.2rem;
	}

	@media (min-width: 1280px) {
		font-size: 1.3rem;
	}

	&:hover {
		color: ${props => props.theme.colors.primary};
	}
`;

export const ThemeToggle = styled.button`
	background-color: transparent;
	border: none;
	height: 2.5rem;
	width: 2.5rem;
	padding: 0;
	cursor: pointer;

	@media (min-width: 768px) {
		height: 3rem;
		width: 3rem;
	}

	@media (min-width: 1280px) {
		height: 3.5rem;
		width: 3.5rem;
	}
`;
