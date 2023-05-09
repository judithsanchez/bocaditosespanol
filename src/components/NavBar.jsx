import React, { useState } from 'react';
import '/src/components/styles/NavBar.css';

function NavBar({ toggleMode, isDarkMode }) {
  const [modeButtonImg, setModeButtonImg] = useState(
    '/src/components/assets/nav-bar/button-to-dark-mode.svg'
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
        '/src/components/assets/nav-bar/button-to-dark-mode.svg'
      );
      setmainLogoImg('/src/components/assets/nav-bar/logo-main-grey.svg');
    }
  };

  return (
    <nav className="NavBar">
      <img src={mainLogoImg} alt="Main Bocaditos Logo" />
      <ul>
        <li>Lessons</li>
        <li>Games</li>
        <li>Practice</li>
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
