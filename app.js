// app.js

import { initOm } from './om-component.js'

// Define your routes and corresponding view templates or functions
const routes = {
  home: () => {
    document.getElementById('app-container').innerHTML = `
      <div id="canvas-container"></div>
    `;
    initOm();
  },

  page1: () => {
    // Render page1 view
    document.getElementById('app-container').innerHTML = '<h1>Page 1</h1>';
  },

  page2: () => {
    // Render page2 view
    document.getElementById('app-container').innerHTML = '<h1>Page 2</h1>';
  },
  // Add more routes and view functions as needed
};

// Function to handle navigation
const navigate = (target) => {
  if (routes[target]) {
    routes[target]();
  } else {
    // Handle invalid route
    document.getElementById('app-container').innerHTML = '<h1>404 - Page Not Found</h1>';
  }
};

// Event listener for navigation links
document.addEventListener('click', (event) => {
  const target = event.target.getAttribute('data-target');
  if (target) {
    event.preventDefault();
    navigate(target);
  }
});

// Initial view rendering
navigate('home');

