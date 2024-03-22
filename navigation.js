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

    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    searchInput.addEventListener('input', () => {
      const searchTerm = searchInput.value.toLowerCase();
      searchResults.innerHTML = '';

      if (searchTerm.length > 0) {
        const filteredPages = pages.filter(page => page.toLowerCase().includes(searchTerm));

        filteredPages.forEach(page => {
          const li = document.createElement('li');
          const link = document.createElement('a');
          link.href = page;
          link.textContent = page.replace('.html', '');
          li.appendChild(link);
          searchResults.appendChild(li);
        });
      }
    });
  })
  .catch(error => {
    console.error('Error fetching pages data:', error);
  });