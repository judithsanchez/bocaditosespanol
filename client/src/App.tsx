import styles from '../styles/global.module.css';
import Navbar from './components/NavBar';
import {themes} from './context/lib/constants';
import {useEffect} from 'react';
import {Route, Routes} from 'react-router-dom';
import {pagePageSections} from './components/lib/constants';
import {AppContextProvider, useAppContext} from './context/AppContext';

const ThemedApp: React.FC<{children: React.ReactNode}> = ({children}) => {
	const {theme} = useAppContext();

	useEffect(() => {
		document.body.className =
			theme === themes.light ? styles.lightMode : styles.darkMode;
	}, [theme]);

	return <div>{children}</div>;
};

const App: React.FC = () => (
	<AppContextProvider>
		<ThemedApp>
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
		</ThemedApp>
	</AppContextProvider>
);

export default App;
