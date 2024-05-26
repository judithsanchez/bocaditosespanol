import {Link} from 'react-router-dom';
import {themes} from '../context/lib/constants';
import ThemeToggle from './ThemeToggle';
import {assets, pagePageSections} from './lib/constants';
import styles from './styles/NavBar.module.css';
import {useAppContext} from '../context/AppContext';

const Navbar: React.FC = () => {
	const {theme} = useAppContext();
	const logoSrc = theme === themes.light ? assets.light.logo : assets.dark.logo;

	return (
		<nav
			className={`${styles.navBar} ${
				theme === themes.light ? styles.lightMode : styles.darkMode
			}`}
		>
			<Link to="/">
				<img className={styles.navBarLogo} src={logoSrc} alt={assets.logoAlt} />
			</Link>
			<div className={styles.navBarCenter}>
				{pagePageSections
					.filter(section => section.isPublic)
					.map(
						(section, index) =>
							section.label !== 'Home' && (
								<Link
									key={index}
									to={section.path}
									className={styles.navBarMenuItem}
								>
									{section.label}
								</Link>
							),
					)}
			</div>
			<div className={styles.noBackgroundNoBorder}>
				<ThemeToggle />
			</div>
		</nav>
	);
};

export default Navbar;
