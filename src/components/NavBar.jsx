import React, { useState } from 'react';
import '/src/components/styles/NavBar.css';
import { Link, NavLink } from 'react-router-dom';

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
    <header className="nav-bar">
      <Link to="/">
        <img
          src={mainLogoImg}
          alt="Bocaditos - Learn Spanish Logo"
          className="nav-bar__logo"
        />
      </Link>
      <nav className="nav-bar--container">
        <ul className="nav-bar__menu">
          {routes.map((route, index) => (
            <li key={index} className="nav-bar__menu-item">
              <NavLink to={route.to} className="nav-bar__menu-link">
                {route.text}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <button
        type="button"
        className="nav-bar__mode-toggle-button"
        aria-label="Toggle Dark Mode"
        onClick={handleModeChange}
      >
        <img
          className="toggle-button--icon"
          src={modeButtonImg}
          alt="Dark Mode Toggle Button"
        />
      </button>
    </header>
  );
}

const routes = [
  {
    to: '/lessons',
    text: 'Lessons',
  },
  {
    to: '/games',
    text: 'Games',
  },
  {
    to: '/practice',
    text: 'Practice',
  },
];

export default NavBar;
