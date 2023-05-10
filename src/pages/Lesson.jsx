import { useState, useEffect } from 'react';

// Pages

// Styles
import '/src/pages/styles/Lesson.css';

// Components

function Lesson({ selectedLesson }) {
  console.log(selectedLesson);
  console.log(typeof selectedLesson);
  return (
    <div className="LessonPage">
      {/* <h1>{selectedLesson.subject}</h1> */}
      <div className="body">
        <div className="explanation"></div>

        <div className="content">
          <div className="keys"></div>
          <div className="examples"></div>
        </div>
      </div>

      <div className="teacher-container">
        <img
          className="navigation-arrow"
          src="/src/pages/assets/lessons/icon-previous-arrow.svg"
          alt="Icon previous arrow"
        />
        <img
          className="teacher-image"
          src="/src/pages/assets/lessons/teacher-intro.svg"
          alt="Teacer explainig"
        />
        <img
          className="navigation-arrow"
          src="/src/pages/assets/lessons/icon-next-arrow.svg"
          alt="Icon next arrow"
        />
      </div>
    </div>
  );
}

export default Lesson;
