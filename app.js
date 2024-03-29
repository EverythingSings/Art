import { initOm } from './om-component.js';

const appContainer = document.getElementById('app-container');

// Define your routes and corresponding view templates or functions
const routes = {
  home: () => {
    appContainer.innerHTML = `
      <div id="canvas-container"></div>
    `;
    initOm();
  },
};

const navigate = (target) => {
  if (routes[target]) {
    routes[target]();
  } else {
    fetch(`${target}.html`)
      .then(response => {
        if (response.ok) {
          return response.text();
        } else {
          throw new Error('Page not found');
        }
      })
      .then(html => {
        appContainer.innerHTML = html;
      })
      .catch(() => {
        appContainer.innerHTML =
          `<h1 style = "color: #fafafa" > 404 - Page Not Found</h1> `;
      });
  }
};

// Fetch the pages data from pages.json
fetch('pages.json')
  .then(response => response.json())
  .then(data => {
    const pages = data.pages;
    const dropdownMenu = document.querySelector('.dropdown-menu');

    // Populate the dropdown menu with page links
    pages.forEach(page => {
      const pageName = page.replace('.html', '');
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = 'javascript:void(0)';
      link.setAttribute('data-target', pageName);
      link.textContent = pageName;
      li.appendChild(link);
      dropdownMenu.appendChild(li);
    });
  });

// NAVIGATION LINKS
document.addEventListener('click', (event) => {
  const target = event.target.getAttribute('data-target');
  if (target) {
    event.preventDefault();
    navigate(target);
  }
});

navigate('home');