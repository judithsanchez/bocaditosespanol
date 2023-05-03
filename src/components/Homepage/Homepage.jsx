import React, { useState } from 'react';
import '/src/components/Homepage/Homepage.css';
import SubscriptionForm from '/src/components/SubscriptionForm/SubscriptionForm';

function Homepage() {
  return (
    <div className="Homepage">
      <div className="first-vp">
        <h1>Learn Spanish in Small Bites!</h1>
        <img src="/src/components/Homepage/assets/icon-teaching.svg" alt="" />

        <SubscriptionForm></SubscriptionForm>

        <p>
          Ready to improve your Spanish skills one bite at a time? Subscribe to
          Bocaditos de Español for free Spanish lessons and activities! Learn
          Spanish in small, fun doses with our engaging content. Don't miss out
          on our latest updates, subscribe now!
        </p>

        <div className="homepage-cards">
          <div className="homepage-card" id="lessons-card"></div>
          <div className="homepage-card" id="youtube-card"></div>
          <div className="homepage-card" id="music-card"></div>
        </div>

        <h2>Tidbits of Spanish Knowledge at Your Fingertips</h2>

        <p>
          Learning a new language can open countless opportunities, from
          building new relationships to advancing your career. Your hard work
          and dedication will be rewarded, which is why we're committed to
          providing fresh content every week. Above all, we want you to make the
          most of your time and achieve your language goals!
        </p>
      </div>
    </div>
  );
}

export default Homepage;
