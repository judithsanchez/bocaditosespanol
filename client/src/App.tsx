import SongsPage from './pages/Songs';
import Admin from './pages/Admin';
import {ThemeProvider, useTheme} from './context/ThemeContext';
import styles from '../styles/global.module.css';
import Navbar from './components/NavBar';
import {themes} from './context/lib/constants';
import {useEffect} from 'react';
import {Route, Routes} from 'react-router-dom';
import VideosPage from './pages/Videos';
import {pagePageSections} from './components/lib/constants';
import {SongProvider} from './context/SongContext';

const ThemedApp: React.FC<{children: React.ReactNode}> = ({children}) => {
	const {theme} = useTheme();

	useEffect(() => {
		document.body.className =
			theme === themes.light ? styles.lightMode : styles.darkMode;
	}, [theme]);

	return <div>{children}</div>;
};

const App: React.FC = () => (
	<ThemeProvider>
		<ThemedApp>
			<SongProvider>
				<Navbar />
				<Routes>
					{pagePageSections.map((section, index) => (
						<Route
							key={index}
							path={section.path}
							element={<section.component />}
						/>
					))}
				</Routes>
			</SongProvider>
		</ThemedApp>
	</ThemeProvider>
);

export default App;
