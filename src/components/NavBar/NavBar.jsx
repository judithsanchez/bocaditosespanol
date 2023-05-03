import React, { useState } from 'react';
import '/src/components/NavBar/NavBar.css';

function NavBar() {
  return (
    <nav className="NavBar">
      <img
        src="/src/components/NavBar/assets/logo-main-grey.svg"
        alt="Main Bocaditos Logo"
      />
      <ul>
        <li>Lessons</li>
        <li>Games</li>
        <li>Practice</li>
      </ul>
      <img
        src="/src/components/NavBar/assets/button-to-dark-mode.svg"
        alt="Dark Mode Button"
      />
    </nav>
  );
}

export default NavBar;
