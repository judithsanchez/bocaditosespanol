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
import {assets, menuItems} from './lib/constants';
import styles from './styles/NavBar.module.css';

const Navbar = () => {
	const {theme} = useTheme();

	const logoSrc = theme === themes.light ? assets.light.logo : assets.dark.logo;

	return (
		<nav
			className={`${styles.navBar} ${
				theme === themes.light ? styles.lightMode : styles.darkMode
			}`}
		>
			<img className={styles.navBarLogo} src={logoSrc} alt={assets.logoAlt} />
			<div className={styles.navBarCenter}>
				{/* {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        to={item.path}
                        className={styles.navBarMenuItem}
                    >
                        {item.label}
                    </Link>
                ))} */}
			</div>
			<div className={styles.noBackgroundNoBorder}>
				<ThemeToggle />
			</div>
		</nav>
	);
};

export default Navbar;
