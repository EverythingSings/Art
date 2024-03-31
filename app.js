import { initOm } from './om-component.js';

const appContainer = document.getElementById('app-container');
const pageContent = document.getElementById('page-content');

// Define your routes and corresponding view templates or functions
const routes = {
  home: () => {
    pageContent.innerHTML = `
      <div id="canvas-container"></div>
    `;
    initOm();
  },
};

const navigate = (target) => {
  if (routes[target]) {
    pageContent.innerHTML = '';
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
        pageContent.innerHTML = html;
        if (typeof routes[target] === 'function') {
          routes[target]();
        }
      })
      .catch(() => {
        pageContent.innerHTML = `<h1 style="color: #fafafa">404 - Page Not Found</h1>`;
      });
  }
};
// Fetch the pages data from pages.json
fetch('spa_pages.json')
  .then(response => response.json())
  .then(data => {
    const pages = data.pages;
    const dropdownMenu = document.querySelector('.dropdown-menu');
    // Populate the dropdown menu with page links
    pages.forEach(page => {

      const pageName = page.replace('.html', '');

      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = '#';
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

// chat.js
document.addEventListener('DOMContentLoaded', () => {
  const chatInput = document.getElementById('chatInput');
  const chatButton = document.getElementById('chatButton');
  const chatResponse = document.getElementById('chatResponse');

  chatButton.addEventListener('click', () => {
    const question = chatInput.value;
    puter.ai.chat(question).then((response) => {
      chatResponse.textContent = response;
    });
  });
});

navigate('home');