import React, { useState } from 'react';
import '/src/components/NavBar/NavBar.css';

function NavBar({ toggleMode, isDarkMode }) {
  const [modeButtonImg, setModeButtonImg] = useState(
    '/src/components/NavBar/assets/button-to-dark-mode.svg'
  );

  const [mainLogoImg, setmainLogoImg] = useState(
    '/src/components/NavBar/assets/logo-main-grey.svg'
  );

  const handleModeChange = () => {
    toggleMode();
    if (!isDarkMode) {
      setModeButtonImg(
        '/src/components/NavBar/assets/button-to-light-mode.svg'
      );
      setmainLogoImg('/src/components/NavBar/assets/logo-main-white.svg');
    } else {
      setModeButtonImg('/src/components/NavBar/assets/button-to-dark-mode.svg');
      setmainLogoImg('/src/components/NavBar/assets/logo-main-grey.svg');
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
