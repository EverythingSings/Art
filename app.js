import { initOm } from './om-component.js';
import { initializeChatPage } from './chat.js';
import { initializeWritingPage } from './writing.js';

const routes = {
  home: {
    template: `<div id="canvas-container"></div>`,
    init: initOm
  },
  chat: {
    template: 'chat.html',
    init: initializeChatPage,
    stylesheet: 'chat.css'
  },
  writing: {
    template: 'writing.html',
    init: initializeWritingPage,
    stylesheet: 'writing.css'
  }
};

const pageContent = document.getElementById('page-content');

const navigate = async (target) => {
  if (routes[target]) {
    const { template, init, stylesheet } = routes[target];

    if (typeof template === 'string') {
      try {
        const response = await fetch(template);
        if (response.ok) {
          const html = await response.text();
          pageContent.innerHTML = html;
          if (typeof init === 'function') {
            init();
          }
          if (stylesheet) {
            loadStylesheet(stylesheet);
          }
        } else {
          throw new Error('Page not found');
        }
      } catch (error) {
        console.error(`Error loading ${target} page:`, error);
        pageContent.innerHTML = `<h1 style="color: #fafafa">404 - Page Not Found</h1>`;
      }
    } else {
      pageContent.innerHTML = template;
      if (typeof init === 'function') {
        init();
      }
    }
  } else {
    pageContent.innerHTML = `<h1 style="color: #fafafa">404 - Page Not Found</h1>`;
  }
};

const populateDropdownMenu = () => {
  const dropdownMenu = document.querySelector('.dropdown-menu');
  Object.keys(routes).forEach(route => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#';
    link.setAttribute('data-target', route);
    link.textContent = route;
    li.appendChild(link);
    dropdownMenu.appendChild(li);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  populateDropdownMenu();

  document.addEventListener('click', (event) => {
    const target = event.target.getAttribute('data-target');
    if (target) {
      event.preventDefault();
      navigate(target);
    }
  });

  navigate('home');
});

function loadStylesheet(url) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}