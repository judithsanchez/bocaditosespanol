import './App.css';
import {Routes, Route, HashRouter} from 'react-router-dom';
import {ThemeProvider} from './context/ThemeContext';
import styled from 'styled-components';
import NavBar from './components/NavBar';
import Homepage from './pages/Homepage';
import SongSelector from './pages/SongSelector';
import SelectedSong from './pages/SelectedSong';

const AppContainer = styled.div`
	min-height: 100vh;
	background-color: ${props => props.theme.colors.background};
	color: ${props => props.theme.colors.onBackground};
	margin: 0;
	padding: 0;
`;

const MainContent = styled.main`
	max-width: 768px;
	margin: 0 auto;
	padding: 0 16px;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
`;
function App() {
	return (
		<HashRouter>
			<ThemeProvider>
				<AppContainer>
					<NavBar />
					<MainContent>
						<Routes>
							<Route path="/" element={<Homepage />} />
							<Route path="/songs" element={<SongSelector />} />
							<Route path="/songs/:songId" element={<SelectedSong />} />
							<Route
								path="*"
								element={
									<p role="alert" aria-live="assertive">
										Not Found
									</p>
								}
							/>
						</Routes>
					</MainContent>
				</AppContainer>
			</ThemeProvider>
		</HashRouter>
	);
}

export default App;
