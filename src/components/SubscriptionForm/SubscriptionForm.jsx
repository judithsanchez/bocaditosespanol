import React, { useState } from 'react';
import '/src/components/SubscriptionForm/SubscriptionForm.css';

function SubscriptionForm() {
  return (
    <form className="SubscriptionForm">
      <input placeholder="youremail@domain.com" type="text" />
      <button>
        <img
          src="/src/components/SubscriptionForm/assets/icon-envelope.svg"
          alt=""
        />
      </button>
    </form>
  );
}

export default SubscriptionForm;
