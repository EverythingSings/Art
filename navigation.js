// Fetch the list of HTML files from the server
fetch('.')
  .then(response => response.text())
  .then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.querySelectorAll('a[href$=".html"]');
    const pages = Array.from(links).map(link => link.href);

    const dropdownMenu = document.querySelector('.dropdown-menu');

    // Populate the dropdown menu with page links
    pages.forEach(page => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = page;
      link.textContent = page.replace('.html', '');
      li.appendChild(link);
      dropdownMenu.appendChild(li);
    });
  })
  .catch(error => {
    console.error('Error fetching HTML files:', error);
  });