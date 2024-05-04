export function initializeWritingPage() {
  fetchArticles()
    .then(articles => {
      displayArticleList(articles);
      handleArticleClick();
      initReadingLevelPicker('.picker', function (selectedLevel) {
        console.log('Selected reading level:', selectedLevel);
      });
      handleSeriesSwitch();
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

function displayArticleList(articles) {
  const articleList = document.getElementById('article-list');
  articleList.innerHTML = '';

  articles.forEach(article => {
    const articleElement = document.createElement('div');
    articleElement.classList.add('article-item');
    articleElement.dataset.articleId = article.id;
    articleElement.textContent = article.title;
    articleList.appendChild(articleElement);
  });
}

function handleArticleClick() {
  const articleList = document.getElementById('article-list');
  articleList.addEventListener('click', event => {
    articleId = event.target.dataset.articleId;
    if (articleId) {
      fetchArticleContent()
        .then(articleContent => {
          displayArticleContent(articleContent);
        })
        .catch(error => {
          console.error('Error fetching article content:', error);
          displayErrorMessage('Failed to load article content. Please try again later.');
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
  return fetch(`article-${articleId}-${selectedLevel}.json`)
    .then(response => response.json());
}

function displayArticleContent(articleContent) {
  const articleContentElement = document.getElementById('article-content');
  const formattedContent = `
    <h2>${articleContent.title}</h2>
    ${articleContent.content.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
  `;
  articleContentElement.innerHTML = formattedContent;

  articleContentElement.scrollTop = 0;
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

      const technoAdaptiveContent = document.querySelector('.techno-adaptive-content');
      const bookReviewsContent = document.querySelector('.book-reviews-content');

      if (series === 'techno-adaptive') {
        technoAdaptiveContent.style.display = 'block';
        bookReviewsContent.style.display = 'none';
      } else if (series === 'book-reviews') {
        technoAdaptiveContent.style.display = 'none';
        bookReviewsContent.style.display = 'block';
      }
    });
  });
}

