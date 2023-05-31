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
    <nav className="NavBar">
      <Link to="/">
        <img src={mainLogoImg} alt="Main Bocaditos Logo" />
      </Link>
      <ul>
        {routes.map((route, index) => (
          <li key={index}>
            <NavLink to={route.to} activeClassName="active-link">
              {route.text}
            </NavLink>
          </li>
        ))}
      </ul>
      <img
        src={modeButtonImg}
        alt="Mode Toggle Button"
        onClick={handleModeChange}
      />
    </nav>
  );
}

const routes = [];

routes.push(
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
  }
);

export default NavBar;
