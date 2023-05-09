import { useState, useEffect } from 'react';

// Styles
import '/src/pages/styles/Lessons.css';

// Components
import LessonsSearch from '/src/components/LessonsSearch.jsx';

function Lessons() {
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

  return (
    <div className="LessonsPage">
      <h1>Learn Spanish One Bite at a Time</h1>
      <LessonsSearch />
      <div className="lessons-container">
        {lessons.map((lesson) => (
          <div
            className="lesson-thumbnail"
            key={lesson.title}
            style={{ backgroundImage: `url(${lesson.thumbnail})` }}
          >
            <div className="lesson-banner">
              <h3>{lesson.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Lessons;
