export function initializeWritingPage() {
  fetchArticles()
    .then(articles => {
      const defaultSeries = "techno-adaptive";
      displayArticleList(articles, defaultSeries);
      handleArticleClick();
      initReadingLevelPicker('.picker', function (selectedLevel) {
        console.log('Selected reading level:', selectedLevel);
      });
      handleSeriesSwitch();

      // Fetch and display the content of the first article in the default series
      const filteredArticles = articles.filter(article => article.series === defaultSeries);
      if (filteredArticles.length > 0) {
        articleId = filteredArticles[0].id;
        fetchArticleContent()
          .then(articleContent => {
            displayArticleContent(articleContent);
          })
          .catch(error => {
            console.error('Error fetching article content:', error);
            displayErrorMessage('Failed to load article content. Please try again later.');
          });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      displayErrorMessage('There was an error initializing the Writing page.');
    });
}
let selectedLevel = "beginner";
let articleId = 1;

function fetchArticles() {
  return fetch('articles.json')
    .then(response => response.json());
}

function handleArticleClick() {
  const articleList = document.getElementById('article-list');
  articleList.addEventListener('click', event => {
    articleId = event.target.dataset.articleId;
    if (articleId) {
      const series = document.querySelector('.series-link.active').dataset.series;
      fetchArticleContent(series)
        .then(articleContent => {
          displayArticleContent(articleContent);
        })
        .catch(error => {
          console.error('Error fetching article content:', error);
          displayErrorMessage('Failed to load article content. Please try selecting a different reading level, or try again later.');
        });
    }
  });
}

function initReadingLevelPicker(selector, callback) {
  const pickerElement = document.querySelector(selector);

  if (pickerElement) {

    const options = pickerElement.querySelectorAll('.option');

    options.forEach(option => {
      option.addEventListener('click', () => {
        options.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedLevel = option.dataset.level;
        fetchArticleContent()
          .then(articleContent => {
            displayArticleContent(articleContent);
          })
        callback(selectedLevel);
      });
    });
  } else { console.debug("No element: ", selector) }
}

initReadingLevelPicker('.picker', function (selectedLevel) {
  console.log('Selected reading level:', selectedLevel);
});


function fetchArticleContent() {
  const seriesPrefix = document.querySelector('.series-link.active').dataset.series;
  return fetch(`${seriesPrefix}-${articleId}-${selectedLevel}.json`)
    .then(response => response.json());
}

function displayArticleContent(articleContent) {
  const articleContentElement = document.getElementById('article-content');
  articleContentElement.innerHTML = '';

  const titleElement = document.createElement('h2');
  titleElement.textContent = articleContent.title;
  articleContentElement.appendChild(titleElement);

  const contentElement = document.createElement('div');
  const formattedContent = articleContent.content.replace(/\n/g, '<br>');
  contentElement.innerHTML = formattedContent;
  articleContentElement.appendChild(contentElement);
}

function displayArticleList(articles, selectedSeries) {
  const articleList = document.getElementById('article-list');
  articleList.innerHTML = '';

  const filteredArticles = articles.filter(article => article.series === selectedSeries);

  filteredArticles.forEach(article => {
    const articleElement = document.createElement('div');
    articleElement.classList.add('article-item');
    articleElement.dataset.articleId = article.id;
    articleElement.textContent = article.title;
    articleList.appendChild(articleElement);
  });
}


function displayErrorMessage(message) {
  const articleContentElement = document.getElementById('article-content');
  articleContentElement.innerHTML = `<p class="error-message">${message}</p>`;
}

function handleSeriesSwitch() {
  const seriesLinks = document.querySelectorAll('.series-link');
  seriesLinks.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const series = event.target.dataset.series;
      seriesLinks.forEach(link => link.classList.remove('active'));
      event.target.classList.add('active');

      fetchArticles()
        .then(articles => {
          displayArticleList(articles, series);
          return articles;
        })
        .then(articles => {
          const filteredArticles = articles.filter(article => article.series === series);
          if (filteredArticles.length > 0) {
            articleId = filteredArticles[0].id;
            return fetchArticleContent();
          } else {
            throw new Error('No articles found for the selected series.');
          }
        })
        .then(articleContent => {
          displayArticleContent(articleContent);
        })
        .catch(error => {
          console.error('Error:', error);
          displayErrorMessage('There was an error loading the articles or displaying the first article.');
        });
    });
  });
}