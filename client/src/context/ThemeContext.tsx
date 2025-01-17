import {createContext, useState, useEffect} from 'react';
import {ThemeProvider as StyledThemeProvider} from 'styled-components';
import {lightTheme, darkTheme} from '../theme/theme';

export const ThemeContext = createContext({
	isDarkMode: false,
	toggleTheme: () => {},
});

export const ThemeProvider = ({children}: {children: React.ReactNode}) => {
	const [isDarkMode, setIsDarkMode] = useState(() => {
		const saved = localStorage.getItem('darkMode');
		return saved ? JSON.parse(saved) : false;
	});

	useEffect(() => {
		localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
	}, [isDarkMode]);

	const toggleTheme = () => setIsDarkMode(!isDarkMode);

	return (
		<ThemeContext.Provider value={{isDarkMode, toggleTheme}}>
			<StyledThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
				{children}
			</StyledThemeProvider>
		</ThemeContext.Provider>
	);
};
