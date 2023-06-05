import React, { useState } from 'react';
import axios from 'axios';
import config from './config';

import '/src/components/styles/SubscriptionForm.css';

function SubscriptionForm() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const apiKey = config.apiKey;

  function handleSubmit(event) {
    event.preventDefault();

    const contact = {
      email,
      listIds: [3],
    };

    axios
      .post('https://api.brevo.com/v3/contacts', contact, {
        headers: {
          'api-key': apiKey,
        },
      })
      .then((response) => {
        console.log('Contact created:', response.data);
        setIsSubscribed(true);
      })
      .catch((error) => {
        console.error('Error creating contact:', error);
      });
  }

  return (
    <form className="SubscriptionForm" onSubmit={handleSubmit}>
      <div className="addEmail">
        <input
          placeholder="youremail@domain.com"
          type="text"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button type="submit">
          <img
            src="https://cdn.bfldr.com/Z0BJ31FP/at/v9gfq3743pshr5vz83rgxg4j/icon-envelope.svg"
            alt="Envelope Icon"
          />
        </button>
      </div>
      {isSubscribed && <p>You are subscribed! ✅</p>}{' '}
    </form>
  );
}

export default SubscriptionForm;
