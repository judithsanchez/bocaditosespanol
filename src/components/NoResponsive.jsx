import React, { useState, useEffect } from 'react';
import '/src/components/styles/NoResponsive.css';

function NoResponsive() {
  return (
    <div className="NoResponsive">
      <div className="overlay"></div>

      <img
        className="evil-bruja-image"
        src="https://cdn.bfldr.com/Z0BJ31FP/at/9frphmfh5mbr8p6njhzm6r7/no-horizontal-mode.svg"
        alt="Evil Bruja"
      />
      <p>
        ⚠️ Watch out for Webby, the malevolent Internet Witch! She sometimes
        haunts the landscape mode of small devices, causing chaos and mischief.
        Stay safe and stick to portrait mode. ⚠️
      </p>
    </div>
  );
}

export default NoResponsive;
