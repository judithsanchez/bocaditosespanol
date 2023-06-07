// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )

import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import App from './App.jsx';
import './index.css';

// Initialize Google Analytics
ReactGA.initialize('G-R7QVHQ6X18');

// Track initial pageview
ReactGA.pageview(window.location.pathname + window.location.search);

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
