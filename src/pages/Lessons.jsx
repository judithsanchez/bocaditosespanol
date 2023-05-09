import { useState, useEffect } from 'react';

// Styles
import '/src/pages/styles/Lessons.css';

// Components
import LessonsSearch from '/src/components/LessonsSearch.jsx';

function Lessons() {
  return (
    <div className="LessonsPage">
      <h1>Learn Spanish One Bite at a Time</h1>
      <LessonsSearch></LessonsSearch>
    </div>
  );
}

export default Lessons;
