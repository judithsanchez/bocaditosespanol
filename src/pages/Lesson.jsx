import React, { useState, useEffect } from 'react';

// Styles
import '/src/pages/styles/Lesson.css';

function Lesson({ slug }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [keyPoints, setKeyPoints] = useState([]);
  const [examples, setExamples] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState();

  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch('/src/pages/data/lessons.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setLessons(data);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      }
    };
    fetchLessons();
  }, []);

  setSelectedLesson(lessons.find((lesson) => lesson.slug === slug));

  const previousStep = () => {
    if (currentStep === 0) {
      return;
    }
    setCurrentStep(currentStep - 1);
  };

  const nextStep = () => {
    if (currentStep === selectedLesson?.steps.length - 1) {
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  useEffect(() => {
    const currentStepObject = selectedLesson?.steps[currentStep];
    setKeyPoints(currentStepObject?.keys || []);
    setExamples(currentStepObject?.examples || []);
  }, [currentStep, selectedLesson]);

  return (
    <div className="LessonPage">
      <h1>{selectedLesson?.subject}</h1>
      <div className="body">
        <div className="explanation">
          <p>{selectedLesson.steps[currentStep].explanation}</p>
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
              src="https://cdn.bfldr.com/Z0BJ31FP/at/498n249kr6fqfbrtcgws77m6/icon-previous-arrow.svg"
              alt="Icon previous arrow"
              onClick={() => previousStep()}
            />
          )}
        </div>

        <img
          className="teacher-image"
          src="https://cdn.bfldr.com/Z0BJ31FP/at/r8vb8ts4p9vvfk6q4v7qn8sg/teacher-intro.svg"
          alt="Teacher explaining"
        />

        <div className="arrow-container">
          {currentStep !== selectedLesson.steps.length - 1 && (
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
