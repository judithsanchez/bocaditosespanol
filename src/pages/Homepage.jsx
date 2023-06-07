import React, { useEffect } from 'react';

import '/src/pages/styles/Homepage.css';
import SubscriptionForm from '/src/components/SubscriptionForm.jsx';
function Homepage() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href =
      'https://cdn.bfldr.com/Z0BJ31FP/at/8sn8fhm3vrh3727bf5mb8tj/icon-teaching.svg';
    document.head.appendChild(link);
  }, []);

  return (
    <div className="homepage">
      <h1 className="homepage__title">Learn Spanish in Small Bites!</h1>
      <img
        className="homepage__main-icon"
        src="https://cdn.bfldr.com/Z0BJ31FP/at/8sn8fhm3vrh3727bf5mb8tj/icon-teaching.svg"
        alt="Bocadito Teaching"
      />

      <SubscriptionForm></SubscriptionForm>

      <p className="homepage__paragraph">
        Ready to improve your Spanish skills one bite at a time? Subscribe to
        Bocaditos de Español for free Spanish lessons and activities! Learn
        Spanish in small, fun doses with our engaging content. Don't miss out on
        our latest updates, subscribe now!
      </p>

      <div className="homepage__cards">
        <div
          className="homepage__card homepage__card--lessons"
          aria-label="Spanish Lessons"
        ></div>
        <div
          className="homepage__card homepage__card--youtube"
          aria-label="YouTube"
        ></div>
        <div
          className="homepage__card homepage__card--music"
          aria-label="Music"
        ></div>
      </div>

      <h2 className="homepage__subtitle">
        Tidbits of Spanish Knowledge at Your Fingertips
      </h2>

      <p className="homepage__paragraph">
        Learning a new language can open countless opportunities, from building
        new relationships to advancing your career. Your hard work and
        dedication will be rewarded, which is why we're committed to providing
        fresh content every week. Above all, we want you to make the most of
        your time and achieve your language goals!
      </p>

      <hr className="homepage__separator homepage__separator--left" />

      <img
        src="https://cdn.bfldr.com/Z0BJ31FP/at/mpp3q7bbvfws97k78ftsb3wz/icon-globe-books-tablet-with-background.svg"
        alt="Globe, books, and tablet"
      />

      <h3 className="homepage__subtitle">
        Are You Just Starting to Learn Spanish?
      </h3>

      <p className="homepage__paragraph">
        Are you just starting to learn Spanish? Perfect! First, check out the
        courses we've created. If you're eager to learn, you may have already
        downloaded Duolingo or another language app and picked up some
        vocabulary. Second, let's learn how to form complete sentences and put
        your new vocabulary to good use!
      </p>

      <hr className="homepage__separator homepage__separator--right" />

      <img
        src="https://cdn.bfldr.com/Z0BJ31FP/at/h96xx59pxzmzmw64cz4m797f/icon-tablet-branches-with-background.svg"
        alt="Tablet and branches"
      />

      <h3 className="homepage__subtitle">
        What If You Have Already Been Learning Spanish for Some Time?
      </h3>

      <p className="homepage__paragraph">
        What if you've already been learning Spanish for some time? Don't worry,
        we've got you covered too! Take our level test to determine where you
        are in your language journey and gain clarity on your path forward. And
        if you're still unsure, feel free to reach out to us via email. We're
        always happy to provide guidance and support.
      </p>

      <hr className="homepage__separator homepage__separator--left" />

      <img
        src="https://cdn.bfldr.com/Z0BJ31FP/at/j465hpvqcpv95x47fgr9kjwn/icon-global-tablet-with-background.svg"
        alt="Globe and tablet"
      />

      <h3 className="homepage__subtitle">Learning Spanish Without Borders</h3>

      <p className="homepage__paragraph">
        Thanks to technology, learning Spanish has never been more practical.
        Study Spanish with lessons created by native speakers and practice with
        authentic content, so you can learn about the culture of
        Spanish-speaking countries as you learn the language. Our goal is not
        just to master Spanish grammar, but to give you the means to achieve the
        ultimate prize - communicating with people! This is the focus of all our
        lessons. Learning Spanish will not only open professional doors but also
        a whole new world of different cultures to explore.
      </p>

      <hr className="homepage__separator homepage__separator--right" />

      <img
        src="https://cdn.bfldr.com/Z0BJ31FP/at/v3b23gtbm8v4p28tpxzphvf/icon-suitcase-heart-briefcase-with-background.svg"
        alt="Suitcase and briefcase"
      />

      <h3 className="homepage__subtitle">
        Any Reasons is Perfect to Learn a New Language
      </h3>

      <p className="homepage__paragraph">
        Love, travel, work - you name it. We've had students learn Spanish for
        all sorts of reasons. So, no matter what motivates you, as long as you
        have it and commit enough time, you'll have the perfect recipe for
        success. Learning Spanish will not only open professional doors but also
        a whole new world of different cultures to explore.
      </p>

      <hr className="homepage__separator homepage__separator--left" />

      <img
        src="https://cdn.bfldr.com/Z0BJ31FP/at/kgpwf6xrbkp9qjk294vtzgk/icon-kids-studying-with-background.svg"
        alt="Kid with tablet"
      />

      <h3 className="homepage__subtitle">
        Give your Child the Gift of a New Language and Open up New Horizons!
      </h3>

      <p className="homepage__paragraph">
        Languages open doors to new worlds - new connections, experiences, and
        opportunities. So, what better gift than teaching your child a new
        language? And yes, I know, nobody wants more classes, but I promise you
        that our activities for children are so fun that they will even want to
        do homework.
      </p>

      <hr className="homepage__separator homepage__separator--right" />

      <img
        src="https://cdn.bfldr.com/Z0BJ31FP/at/ct8n7r6vj892r5jrrw35w6/icon-heart-medical-kit-with-background.svg"
        alt="Medical Spanish"
      />

      <h3 className="homepage__subtitle">
        Expanding your Knowledge While Learning Spanish!
      </h3>

      <p className="homepage__paragraph">
        Learning a new language can open up new worlds of opportunities,
        connections, and experiences. So, what better way to give your child a
        head start than by teaching them a new language? We know that no one
        wants more classes, but our fun activities for children will have them
        enjoying their Spanish lessons and even asking for more homework.
      </p>
    </div>
  );
}

export default Homepage;
