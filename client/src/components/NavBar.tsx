/**
 * Renders the navigation bar component for the application.
 *
 * The `Navbar` component is responsible for rendering the application's navigation bar, which includes the logo and a theme toggle button. The logo image displayed is determined by the current theme (light or dark).
 *
 * @returns {JSX.Element} The rendered navigation bar component.
 */
// import {Link} from 'react-router-dom';
import {useTheme} from '../context/ThemeContext';
import {themes} from '../context/lib/constants';
import ThemeToggle from './ThemeToggle';
import {assets, menuItems, navBar} from './lib/constants';

const Navbar = () => {
	const {theme} = useTheme();

	const logoSrc = theme === themes.light ? assets.light.logo : assets.dark.logo;

	return (
		<nav className={`${navBar.cssClasses.navbarClass} ${theme}`}>
			<img
				className={navBar.cssClasses.navbarLogoClass}
				src={logoSrc}
				alt={assets.logoAlt}
			/>
			<div className={navBar.cssClasses.navbarCenterClass}>
				{/* {menuItems.map((item, index) => (
					<Link
						key={index}
						to={item.path}
						className={navBar.cssClasses.navbarMenuItemClass}
					>
						{item.label}
					</Link>
				))} */}
			</div>
			<div className={navBar.cssClasses.navbarRightClass}>
				<ThemeToggle />
			</div>
		</nav>
	);
};

export default Navbar;
