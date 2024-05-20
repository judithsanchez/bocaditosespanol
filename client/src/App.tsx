// import Dashboard from './pages/Dashboard';
import {useEffect} from 'react';
import SongsPage from './pages/Songs';
import {ThemeProvider, useTheme} from './context/ThemeContext';
import './styles.css';
import Navbar from './components/NavBar';
import {themes} from './context/lib/constants';
import {themesCSS} from './pages/lib/constants';

const ThemedApp: React.FC = () => {
	const {theme} = useTheme();

	useEffect(() => {
		document.body.className =
			theme === themes.light
				? themesCSS.lightModeClass
				: themesCSS.darkModeClass;
	}, [theme]);

	return (
		<div>
			<Navbar />
		</div>
	);
};
const App: React.FC = () => (
	<ThemeProvider>
		<ThemedApp />
		<SongsPage />
		{/* <Dashboard /> */}
	</ThemeProvider>
);

export default App;
