// import Dashboard from './pages/Dashboard';
import SongsPage from './pages/Songs';
import {ThemeProvider, useTheme} from './context/ThemeContext';
import styles from '../styles/global.module.css';
import Navbar from './components/NavBar';
import {themes} from './context/lib/constants';
import {useEffect} from 'react';

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
			<Navbar />
			<SongsPage />
			{/* <Dashboard /> */}
		</ThemedApp>
	</ThemeProvider>
);

export default App;
