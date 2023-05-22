import { useState, useEffect } from 'react';

// Styles
import '/src/components/styles/LessonsSearch.css';

function LessonsSearch() {
  return (
    <form className="LessonsSearch">
      <input type="text" />
      <button>
        <img
          src="https://cdn.bfldr.com/Z0BJ31FP/at/f53qtr9wb6rt8kqg3g28bjsr/icon-search.svg"
          alt="Search Icon"
        />
      </button>
    </form>
  );
}

export default LessonsSearch;
