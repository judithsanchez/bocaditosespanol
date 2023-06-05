import React, { useState } from 'react';
import axios from 'axios';

import '/src/components/styles/SubscriptionForm.css';

function SubscriptionForm() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  function handleSubmit(event) {
    event.preventDefault();

    const contact = {
      email,
      listIds: [3],
    };

    axios
      .post('https://api.brevo.com/v3/contacts', contact, {
        headers: {
          'api-key':
            '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',
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
