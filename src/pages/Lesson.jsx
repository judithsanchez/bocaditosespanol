import { useState, useEffect } from 'react';

// Styles
import '/src/pages/styles/Lesson.css';

// Components

function Lesson({ selectedLesson }) {
  const lesson = selectedLesson;
  // const steps = lesson?.steps;
  // const numberOfSteps = lesson?.steps.length;

  const [currentStep, setCurrentStep] = useState(0);

  const previousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  return (
    <div className="LessonPage">
      <h1>{lesson?.subject}</h1>
      <div className="body">
        <div className="explanation">
          <p>{lesson?.steps[currentStep].explanation}</p>
        </div>

        <div className="content">
          <div className="keys">
            <h3>Key Points</h3>
          </div>
          <div className="examples">
            <h3>Examples</h3>
          </div>
        </div>
      </div>

      <div className="teacher-container">
        <img
          className="navigation-arrow"
          src="/src/pages/assets/lessons/icon-previous-arrow.svg"
          alt="Icon previous arrow"
          onClick={() => previousStep()}
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
          onClick={() => nextStep()}
        />
      </div>
    </div>
  );
}

export default Lesson;
