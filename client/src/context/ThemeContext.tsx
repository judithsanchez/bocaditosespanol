/**
 * Provides a React context for managing the application's theme.
 *
 * The `ThemeProvider` component wraps the application and provides a `theme` state and a `toggleTheme` function to toggle between the light and dark themes.
 *
 * The `useTheme` hook can be used by child components to access the current theme and toggle the theme.
 */
import React, {createContext, useContext, useState, ReactNode} from 'react';
import {errors, themes} from './lib/constants';

type Theme = typeof themes.light | typeof themes.dark;

export interface ThemeContextProps {
	theme: Theme;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{children: ReactNode}> = ({children}) => {
	const [theme, setTheme] = useState<Theme>(themes.light);

	const toggleTheme = () => {
		setTheme(prevTheme =>
			prevTheme === themes.light ? themes.dark : themes.light,
		);
	};

	return (
		<ThemeContext.Provider value={{theme, toggleTheme}}>
			{children}
		</ThemeContext.Provider>
	);
};

// Custom hook
export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error(errors.useTheme);
	}
	return context;
};
