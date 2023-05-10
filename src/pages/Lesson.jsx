import { useState, useEffect } from 'react';

// Styles
import '/src/pages/styles/Lesson.css';

// Components

function Lesson({ selectedLesson }) {
  const lesson = selectedLesson;

  const [currentStep, setCurrentStep] = useState(0);
  const [keyPoints, setKeyPoints] = useState([]);
  const [examples, setExamples] = useState([]);

  const previousStep = () => {
    if (currentStep === 0) {
      return;
    }
    setCurrentStep(currentStep - 1);
  };

  const nextStep = () => {
    if (currentStep === lesson?.steps.length - 1) {
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  useEffect(() => {
    const currentStepObject = lesson?.steps[currentStep];
    setKeyPoints(currentStepObject?.keys || []);
    setExamples(currentStepObject?.examples || []);
  }, [currentStep, lesson]);

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
            {keyPoints.map((point, index) => (
              <p className="point" key={index}>
                {point}
              </p>
            ))}
          </div>
          <div className="examples">
            <h3>Examples</h3>
            {examples.map((example, index) => (
              <p className="example" key={index}>
                {example}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="teacher-container">
        <div className="arrow-container">
          {currentStep > 0 && (
            <img
              className="navigation-arrow"
              src="/src/pages/assets/lessons/icon-previous-arrow.svg"
              alt="Icon previous arrow"
              onClick={() => previousStep()}
            />
          )}
        </div>

        <img
          className="teacher-image"
          src="/src/pages/assets/lessons/teacher-intro.svg"
          alt="Teacher explaining"
        />

        <div className="arrow-container">
          {currentStep !== lesson?.steps.length - 1 && (
            <img
              className="navigation-arrow"
              src="/src/pages/assets/lessons/icon-next-arrow.svg"
              alt="Icon next arrow"
              onClick={() => nextStep()}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Lesson;
