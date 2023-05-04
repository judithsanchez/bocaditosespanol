import { useState } from 'react';

import '/src/components/Footer/Footer.css';
import SubscriptionForm from '/src/components/SubscriptionForm/SubscriptionForm';

function Footer() {
  return (
    <div className="Footer">
      <SubscriptionForm></SubscriptionForm>
      <p>Stay up-to-date with our latest activities by subscribing now!</p>
    </div>
  );
}

export default Footer;
