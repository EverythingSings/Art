import { initOm } from './om-component.js';
import { initializeChatPage } from './chat.js';
import { initializeWritingPage } from './writing.js';
import { initializeBoids } from './boids.js';
const pages = ['chat', 'writing'];

const pageContent = document.getElementById('page-content');

const routes = {
  home: () => {
    pageContent.innerHTML = `
      <div id="canvas-container"></div>
    `;
    initOm();
  },
  chat: () => {
    fetch('chat.html')
      .then(response => response.text())
      .then(html => {
        pageContent.innerHTML = html;
        initializeChatPage();
        loadStylesheet('chat.css');
      })
      .catch(error => {
        console.error('Error loading chat page:', error);
      });
  },
  writing: () => {
    fetch('writing.html')
      .then(response => response.text())
      .then(html => {
        pageContent.innerHTML = html;
        initializeWritingPage();
        loadStylesheet('writing.css');
      })
      .catch(error => {
        console.error('Error loading writing page:', error);
      });
  },
  boids: () => {
    fetch('boids.html')
      .then(response => response.text())
      .then(html => {
        pageContent.innerHTML = html;
        initializeBoids();
        loadStylesheet('boids.css');
      })
      .catch(error => {
        console.error('Error loading boids page:', error);
      });
  },
};

const navigate = (target) => {
  if (routes[target]) {
    pageContent.innerHTML = '';
    routes[target]();
  } else if (target === 'home') {
    pageContent.innerHTML = `
      <div id="canvas-container"></div>
    `;
    initOm();
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

function getPageTitle(pageName) {

  switch (pageName) {
    case 'writing':
      return "Blog";

    case 'chat':
      return "EveAI";

    default:
      return pageName;
  }
}

const dropdownMenu = document.querySelector('.dropdown-menu');
// Populate the dropdown menu with page links
pages.forEach(page => {
  const pageName = page.replace('.html', '');
  const li = document.createElement('li');
  const link = document.createElement('a');
  link.href = '#';
  link.setAttribute('data-target', pageName);



  link.textContent = getPageTitle(pageName);
  li.appendChild(link);
  dropdownMenu.appendChild(li);
});

document.addEventListener('DOMContentLoaded', function () {
  const dropdown = document.querySelector('.dropdown');
  const dropdownToggle = document.querySelector('.dropdown-toggle');

  dropdownToggle.addEventListener('click', function (event) {
    event.preventDefault();
    dropdown.classList.toggle('active');
  });

  document.addEventListener('click', function (event) {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove('active');
    }
  });
});

// NAVIGATION LINKS
document.addEventListener('click', (event) => {
  const target = event.target.getAttribute('data-target');
  if (target) {
    event.preventDefault();
    if (routes[target]) {
      navigate(target);
    } else {
      console.error(`Route not found for target: ${target}`);
    }
  }
});

function loadScript(url) {
  const script = document.createElement('script');
  script.src = url;
  document.head.appendChild(script);
}

function loadStylesheet(url) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

navigate('home');