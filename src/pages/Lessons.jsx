import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Data
import lessons from './data/lessons.json'; // Test

// Styles
import '/src/pages/styles/Lessons.css';

// Components
// import LessonsSearch from '/src/components/LessonsSearch.jsx';
function LessonsPage() {
  return (
    <div className="LessonsPage">
      <h1>Learn Spanish One Bite at a Time</h1>

      <div className="lessons-container">
        {lessons.map((lesson, index) => (
          <Link
            className="lesson-link"
            key={index}
            to={`/lessons/${lesson.slug}`}
          >
            <LessonThumbnail lesson={lesson} />
          </Link>
        ))}
      </div>
    </div>
  );
}

function LessonThumbnail({ lesson }) {
  return (
    <div className="LessonThumbnail" key={lesson.id}>
      <div className="difficulty">
        {Array.from({ length: lesson.difficulty }, (_, i) => (
          <span key={i} role="img" aria-label="fire emoji">
            🔥
          </span>
        ))}
      </div>
      <h3 className="lesson-thumbnail-highlight">{lesson.title}</h3>
      <div className="importance">{lesson.importance}</div>
    </div>
  );
}

export default LessonsPage;
