/**
 * A React functional component that renders a button to toggle the application's theme between light and dark modes.
 *
 * The component uses the `useTheme` hook from the `ThemeContext` to access the current theme and the `toggleTheme` function to switch between themes.
 *
 * The button displays an image that changes based on the current theme. If the current theme is 'light', the button displays an image for the dark theme button. If the current theme is 'dark', the button displays an image for the light theme button.
 *
 * When the button is clicked, the `toggleTheme` function is called, which updates the theme in the `ThemeContext` and triggers a re-render of the application with the new theme.
 */
import React from 'react';
import {useTheme} from '../context/ThemeContext';
import {themes} from '../context/lib/constants';
import {assets} from './lib/constants';
import styles from './styles/ThemeToggle.module.css';

const ThemeToggle: React.FC = () => {
	const {theme, toggleTheme} = useTheme();

	return (
		<button className={styles.noBackgroundNoBorder} onClick={toggleTheme}>
			{theme === themes.light ? (
				<img
					className={styles.navbarThemeToggleIcon}
					src={assets.light.darkThemeButton}
					alt={assets.light.darkThemeButtonAlt}
				/>
			) : (
				<img
					className={styles.navbarThemeToggleIcon}
					src={assets.dark.lightthemeButton}
					alt={assets.dark.lightThemeButtonAlt}
				/>
			)}
		</button>
	);
};

export default ThemeToggle;
