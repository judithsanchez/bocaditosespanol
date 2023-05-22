import React, { useState } from 'react';
import '/src/components/styles/SubscriptionForm.css';

function SubscriptionForm() {
  return (
    <form className="SubscriptionForm">
      <input placeholder="youremail@domain.com" type="text" />
      <button>
        <img
          src="https://cdn.bfldr.com/Z0BJ31FP/at/v9gfq3743pshr5vz83rgxg4j/icon-envelope.svg"
          alt="Envelope Icon"
        />
      </button>
    </form>
  );
}

export default SubscriptionForm;
