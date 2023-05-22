import React, { useState } from 'react';
import '/src/components/styles/NavBar.css';
import { Link } from 'react-router-dom';

function NavBar({ toggleMode, isDarkMode }) {
  const [modeButtonImg, setModeButtonImg] = useState(
    'https://cdn.bfldr.com/Z0BJ31FP/at/r9vn7sx7x3mg5tww6gshsvt/button-to-dark-mode.svg?auto=webp&format=svg'
  );

  const [mainLogoImg, setmainLogoImg] = useState(
    '/src/components/assets/nav-bar/logo-main-grey.svg'
  );

  const handleModeChange = () => {
    toggleMode();
    if (!isDarkMode) {
      setModeButtonImg(
        '/src/components/assets/nav-bar/button-to-light-mode.svg'
      );
      setmainLogoImg('/src/components/assets/nav-bar/logo-main-white.svg');
    } else {
      setModeButtonImg(
        'https://cdn.bfldr.com/Z0BJ31FP/at/r9vn7sx7x3mg5tww6gshsvt/button-to-dark-mode.svg?auto=webp&format=svg'
      );
      setmainLogoImg('/src/components/assets/nav-bar/logo-main-grey.svg');
    }
  };

  return (
    <nav className="NavBar">
      <Link to="/">
        <img src={mainLogoImg} alt="Main Bocaditos Logo" />
      </Link>
      <ul>
        <li>
          <Link to="/lessons">Lessons</Link>
        </li>
        <li>
          <Link to="/games">Games</Link>
        </li>
        <li>
          <Link to="/practice">Practice</Link>
        </li>
      </ul>
      <img
        src={modeButtonImg}
        alt="Mode Toggle Button"
        onClick={handleModeChange}
      />
    </nav>
  );
}

export default NavBar;
