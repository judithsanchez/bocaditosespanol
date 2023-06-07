import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Data
import lessons from './data/lessons.json';

// Styles
import '/src/pages/styles/Lesson.css';

// Components

import ProgressBar from '../components/ProgressBar';

function Lesson() {
  const { slug } = useParams();

  const lesson = lessons.find((lesson) => lesson.slug === slug);

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
    const currentStepKeyPoints = currentStepObject?.keys || [];

    const accumulatedKeyPoints = lesson.steps
      .slice(0, currentStep)
      .reduce(
        (accumulated, step) => [...accumulated, ...(step.keys || [])],
        []
      );

    setKeyPoints(
      Array.from(new Set([...accumulatedKeyPoints, ...currentStepKeyPoints]))
    );

    setExamples(currentStepObject?.examples || []);
  }, [currentStep, lesson]);

  return (
    <div className="LessonPage">
      <div className="title-progressBar-container">
        <h1>{lesson?.subject}</h1>
        <ProgressBar
          currentStep={currentStep}
          totalSteps={lesson?.steps.length - 1}
        />
      </div>

      <div className="keyPoints-container">
        <h3 className="keyPointsTitle">🔑 Key Points</h3>
        <div className="keys">
          {keyPoints.map((point, index) => (
            <p className="point" key={index}>
              {point}
            </p>
          ))}
        </div>
      </div>

      <div className="examples-teacher-container">
        <h3 className="exampleTitle">💡 Examples</h3>

        <div className="examples">
          {examples.map((example, index) => (
            <p key={index}>{example}</p>
          ))}
        </div>

        <div className="teacher-container">
          <img
            className="teacher"
            src="https://cdn.bfldr.com/Z0BJ31FP/at/r8vb8ts4p9vvfk6q4v7qn8sg/teacher-intro.svg"
            alt="Teacher explaining"
          />
        </div>

        <div className="arrow-left">
          {currentStep > 0 && (
            <img
              className="navigation-arrow"
              src="https://cdn.bfldr.com/Z0BJ31FP/at/498n249kr6fqfbrtcgws77m6/icon-previous-arrow.svg"
              alt="Icon previous arrow"
              onClick={() => previousStep()}
            />
          )}
        </div>

        <div className="explanation">
          <p>{lesson.steps[currentStep].explanation}</p>
        </div>

        <div className="arrow-right">
          {currentStep !== lesson.steps.length - 1 && (
            <img
              className="navigation-arrow"
              src="https://cdn.bfldr.com/Z0BJ31FP/as/2s36qjvpjsggrbgp9m3vt/icon-next-arrow?auto=webp&format=png"
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
