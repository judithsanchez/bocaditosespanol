'use client';

import {createContext, useState, useEffect, ReactNode} from 'react';
import {ThemeProvider as StyledThemeProvider} from 'styled-components';
import {lightTheme, darkTheme} from '@/lib/theme/theme';

export const ThemeContext = createContext({
	isDarkMode: false,
	toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{children: ReactNode}> = ({children}) => {
	const [isDarkMode, setIsDarkMode] = useState(false);

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			setIsDarkMode(savedTheme === 'dark');
		} else {
			const prefersDark = window.matchMedia(
				'(prefers-color-scheme: dark)',
			).matches;
			setIsDarkMode(prefersDark);
		}
	}, []);

	const toggleTheme = () => {
		const newMode = !isDarkMode;
		setIsDarkMode(newMode);
		localStorage.setItem('theme', newMode ? 'dark' : 'light');
	};

	const theme = isDarkMode ? darkTheme : lightTheme;

	return (
		<ThemeContext.Provider value={{isDarkMode, toggleTheme}}>
			<StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
		</ThemeContext.Provider>
	);
};
