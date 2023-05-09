import { useState } from 'react';

import '/src/components/styles/Footer.css';
import SubscriptionForm from '/src/components/SubscriptionForm.jsx';

function Footer() {
  return (
    <div className="Footer">
      <SubscriptionForm></SubscriptionForm>
      <p>Stay up-to-date with our latest activities by subscribing now!</p>
    </div>
  );
}

export default Footer;
