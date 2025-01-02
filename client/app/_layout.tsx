import {PaperProvider} from 'react-native-paper';
import {lightTheme, darkTheme} from '@/constants/Theme';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {useState, createContext, useContext} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';

type ThemeContextType = {
	isDarkMode: boolean;
	toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
	isDarkMode: false,
	toggleTheme: () => {},
});

export function useAppTheme() {
	return useContext(ThemeContext);
}

export default function RootLayout() {
	const [isDarkMode, setIsDarkMode] = useState(true);
	const theme = isDarkMode ? darkTheme : lightTheme;

	const toggleTheme = () => setIsDarkMode(!isDarkMode);

	return (
		<SafeAreaProvider>
			<ThemeContext.Provider value={{isDarkMode, toggleTheme}}>
				<PaperProvider theme={theme}>
					<Stack
						screenOptions={{
							headerStyle: {
								backgroundColor: theme.colors.surface,
							},
							headerTintColor: theme.colors.onSurface,
							contentStyle: {
								backgroundColor: theme.colors.background,
							},
						}}
					></Stack>
					<StatusBar style={isDarkMode ? 'light' : 'dark'} />
				</PaperProvider>
			</ThemeContext.Provider>
		</SafeAreaProvider>
	);
}
