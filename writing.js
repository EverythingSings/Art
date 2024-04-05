export function initializeWritingPage() {
  fetchArticles()
    .then(articles => {
      displayArticleList(articles);
      handleArticleClick();
    })
    .catch(error => {
      console.error('Error fetching articles:', error);
      displayErrorMessage('Failed to load articles. Please try again later.');
    });
}

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
    const articleId = event.target.dataset.articleId;
    if (articleId) {
      fetchArticleContent(articleId)
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

function fetchArticleContent(articleId) {
  return fetch(`article-${articleId}.json`)
    .then(response => response.json());
}

function displayArticleContent(articleContent) {
  const articleContentElement = document.getElementById('article-content');
  articleContentElement.innerHTML = `
    <h2>${articleContent.title}</h2>
    <p>${articleContent.content}</p>
  `;
}

function displayErrorMessage(message) {
  const articleContentElement = document.getElementById('article-content');
  articleContentElement.innerHTML = `<p class="error-message">${message}</p>`;
}