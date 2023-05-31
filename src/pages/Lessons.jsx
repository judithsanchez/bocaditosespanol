import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Data
import lessons from './data/lessons.json'; // Test

// Styles
import '/src/pages/styles/Lessons.css';

// Components
import LessonsSearch from '/src/components/LessonsSearch.jsx';

function Lessons() {
  return (
    <div className="LessonsPage">
      <h1>Learn Spanish One Bite at a Time</h1>
      <LessonsSearch />

      <div className="lessons-container">
        {lessons.map((lesson, index) => (
          <Link key={index} to={`/lessons/${lesson.slug}`}>
            <div
              className="lesson-thumbnail"
              key={lesson.id}
              style={{ backgroundImage: `url(${lesson.thumbnail})` }}
            >
              <div className="lesson-banner">
                <h3>{lesson.title}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Lessons;
