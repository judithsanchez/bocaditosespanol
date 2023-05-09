import { useState, useEffect } from 'react';

import { Switch as RouterSwitch, Route, BrowserRouter } from 'react-router-dom';

// Pages
import Homepage from './pages/Homepage';
import Lessons from './pages/Lessons';

// Styles
import '/src/App.css';

// Components
import NavBar from './components/NavBar';
import Footer from './components/Footer';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.style.setProperty(
        '--current-mode-box-shadow',
        '0px 1px 4px -2px rgba(168, 168, 168, 0.25)'
      );
      document.documentElement.style.setProperty('--current-mode', '#333333');
      document.documentElement.style.setProperty(
        '--current-mode-text',
        'white'
      );
    } else {
      document.documentElement.style.setProperty(
        '--current-mode-box-shadow',
        '0px 3px 4px -2px rgba(0, 0, 0, 0.25)'
      );
      document.documentElement.style.setProperty('--current-mode', 'white');
      document.documentElement.style.setProperty(
        '--current-mode-text',
        'black'
      );
    }
  }, [isDarkMode]);

  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <BrowserRouter>
      <div className="App">
        <NavBar toggleMode={toggleMode} isDarkMode={isDarkMode} />
        <RouterSwitch>
          <Route path="/" exact component={Homepage} />
          <Route path="/lessons" component={Lessons} />
        </RouterSwitch>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
