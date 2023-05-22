import React, { useState } from 'react';
import '/src/components/styles/NavBar.css';
import { Link } from 'react-router-dom';

function NavBar({ toggleMode, isDarkMode }) {
  const [modeButtonImg, setModeButtonImg] = useState(
    'https://cdn.bfldr.com/Z0BJ31FP/at/r9vn7sx7x3mg5tww6gshsvt/button-to-dark-mode.svg'
  );

  const [mainLogoImg, setmainLogoImg] = useState(
    'https://cdn.bfldr.com/Z0BJ31FP/at/ggx73vmcsmrspvt9fb8wg5kc/logo-main-grey.svg'
  );

  const handleModeChange = () => {
    toggleMode();
    if (!isDarkMode) {
      setModeButtonImg(
        'https://cdn.bfldr.com/Z0BJ31FP/at/k87sm4jtprcnv89f7fq4nqv/button-to-light-mode.svg'
      );
      setmainLogoImg(
        'https://cdn.bfldr.com/Z0BJ31FP/at/7bq35cg9mzk7bngwjnt645w/logo-main-white.svg'
      );
    } else {
      setModeButtonImg(
        'https://cdn.bfldr.com/Z0BJ31FP/at/r9vn7sx7x3mg5tww6gshsvt/button-to-dark-mode.svg'
      );
      setmainLogoImg(
        'https://cdn.bfldr.com/Z0BJ31FP/at/ggx73vmcsmrspvt9fb8wg5kc/logo-main-grey.svg'
      );
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
