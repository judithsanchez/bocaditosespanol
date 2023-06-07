import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Pages
import Homepage from './pages/Homepage';
import Lessons from './pages/Lessons';
import Lesson from './pages/Lesson';
import Practice from './pages/Practice';
import Games from './pages/Games';

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
      document.documentElement.style.setProperty(
        '--current-mode-lesson-thumbnail-highlight',
        '#db4d89'
      );
      document.documentElement.style.setProperty(
        '--current-mode-lesson-thumbnail-card',
        '#474747'
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
      document.documentElement.style.setProperty(
        '--current-mode-lesson-thumbnail-highlight',
        '#47d8e0'
      );
      document.documentElement.style.setProperty(
        '--current-mode-lesson-thumbnail-card',
        'white'
      );
    }
  }, [isDarkMode]);

  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="app-container">
      <HashRouter>
        <NavBar toggleMode={toggleMode} isDarkMode={isDarkMode} />

        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/lessons/:slug" element={<Lesson />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/games" element={<Games />} />
          <Route
            path="*"
            element={
              <p role="alert" aria-live="assertive">
                Not Found
              </p>
            }
          />
        </Routes>

        <Footer />
      </HashRouter>
    </div>
  );
}

export default App;
