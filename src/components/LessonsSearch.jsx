import { useState, useEffect } from 'react';

// Styles
import '/src/components/styles/LessonsSearch.css';

function LessonsSearch() {
  return (
    <form className="LessonsSearch">
      <input type="text" />
      <button>
        <img
          src="/src/components/assets/lessons-search/icon-search.svg"
          alt="Search Icon"
        />
      </button>
    </form>
  );
}

export default LessonsSearch;
