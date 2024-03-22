// Fetch the pages data from pages.json
fetch('pages.json')
  .then(response => response.json())
  .then(data => {
    const pages = data.pages;
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
