import React from 'react';
import '/src/components/styles/SubscriptionForm.css';

function SubscriptionForm() {
  return (
    <form className="subscription-form">
      <a
        href="https://fc6a2b43.sibforms.com/serve/MUIEAK3OOTkmgTbF3ByIeSfi5wDSsHwWIWD3ers5frOIw9rXRX1IB4WrJ77STOOxDpNa5zYLKZP7OnHG9r_PsnPb8FY_10uiIHoIpA4TuRaMdCFKdKJ-nS5O5KJ8tgmKbnqpy8fJMxUJ08wLOw95yLsVocILsLGvWs0Gy7hBsKGcnQ-oCQLEl1rRCihpCzW5paoQXDXTJbGRf6ub"
        aria-label="Subscribe to our newsletter"
        className="subscription-form__link"
      >
        Subscribe!
      </a>
      <img
        src="https://cdn.bfldr.com/Z0BJ31FP/at/v9gfq3743pshr5vz83rgxg4j/icon-envelope.svg"
        alt="Envelope Icon"
        aria-label="Envelope Icon"
        className="subscription-form__icon"
      />
    </form>
  );
}

export default SubscriptionForm;
