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

    const currentStepObject = lesson?.steps[currentStep];

    if (currentStepObject.keys) {
      keyPoints.push(...currentStepObject.keys);
    }

    if (currentStepObject.examples) {
      examples.push(...currentStepObject.examples);
    } else {
      examples.push([]);
    }

    setCurrentStep(currentStep + 1);
  };

  useEffect(() => {
    setKeyPoints(lesson?.steps[currentStep].keys || []);
    setExamples(lesson?.steps[currentStep].examples || []);
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
        <img
          className="navigation-arrow"
          src="/src/pages/assets/lessons/icon-previous-arrow.svg"
          alt="Icon previous arrow"
          onClick={() => previousStep()}
        />
        <img
          className="teacher-image"
          src="/src/pages/assets/lessons/teacher-intro.svg"
          alt="Teacher explaining"
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
