const errorMessage = "Failed to load article content. Please try selecting a different reading level, or try again later.";


export function initializeWritingPage() {

  fetchArticles()
    .then(articles => {
      const defaultSeries = "techno-adaptive";
      setupPage(articles, defaultSeries);
    })
    .catch(error => {
      console.error('Error:', error);
      displayErrorMessage('There was an error initializing the Writing page.');
    });
}

let selectedLevel = "intermediate";
let articleId = 1;
let points = parseInt(localStorage.getItem('points')) || 0;
let achievements = [];
let lastLoadedArticleId = null;
let lastLoadedLevel = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('points').textContent = `Points: ${points}`;
  updateProgressBar();
});

function updatePoints(newPoints) {
  points += newPoints;
  localStorage.setItem('points', points);
  document.getElementById('points').textContent = `Points: ${points}`;
  updateProgressBar();
}

function addAchievement(achievement) {
  if (!achievements.includes(achievement)) {
    achievements.push(achievement);
    document.getElementById('achievements').textContent = `Achievements: ${achievements.join(', ')}`;
  }
}

function updateProgressBar() {
  const progressBarFill = document.querySelector('.progress-bar-fill');
  const progress = (points / 100) * 10; 
  progressBarFill.style.width = `${progress}%`;
}

function fetchArticles() {
  return fetch('articles.json')
    .then(response => response.json());
}

function fetchArticleContent(series, articleId, level) {
  return fetch(`${series}-${articleId}-${level}.json`)
    .then(response => response.json());
}

function setupPage(articles, defaultSeries) {
  displayArticleList(articles, defaultSeries);
  handleArticleClick();
  initReadingLevelPicker('.picker', onReadingLevelChange);
  handleSeriesSwitch();

  const filteredArticles = articles.filter(article => article.series === defaultSeries);
  if (filteredArticles.length > 0) {
    articleId = filteredArticles[0].id;
    loadArticleContent(defaultSeries, articleId, selectedLevel);
  }
}

function loadArticleContent(series, articleId, level) {
  if (articleId === lastLoadedArticleId && level === lastLoadedLevel) {
    return; // Do not load the same article again with the same level
  }

  fetchArticleContent(series, articleId, level)
    .then(articleContent => {
      displayArticleContent(articleContent);
      if (articleId !== lastLoadedArticleId || level !== lastLoadedLevel) {
        updatePoints(1); 
        if (points >= 50) addAchievement('First 50 Points');
      }
      lastLoadedArticleId = articleId; // Update the last loaded article ID
      lastLoadedLevel = level; // Update the last loaded level
    })
    .catch(error => {
      console.error(`Error fetching article content for level ${level}:`, error);
      const availableLevels = ["beginner", "intermediate", "advanced"].filter(l => l !== level);
      let found = false;

      (async function tryOtherLevels() {
        for (let i = 0; i < availableLevels.length; i++) {
          try {
            const articleContent = await fetchArticleContent(series, articleId, availableLevels[i]);
            displayArticleContent(articleContent);
            selectedLevel = availableLevels[i];
            updateReadingLevelPicker(selectedLevel);
            found = true;
            break;
          } catch (err) {
            console.error(`Error fetching article content for level ${availableLevels[i]}:`, err);
          }
        }
        if (!found) {
          displayErrorMessage(errorMessage);
        }
      })();
    });
}

function updateReadingLevelPicker(level) {
  const pickerElement = document.querySelector('.picker');
  if (pickerElement) {
    const options = pickerElement.querySelectorAll('.option');
    options.forEach(option => {
      option.classList.remove('selected');
      if (option.dataset.level === level) {
        option.classList.add('selected');
      }
    });
  }
}

function handleArticleClick() {
  const articleList = document.getElementById('article-list');
  articleList.addEventListener('click', event => {
    const clickedArticleId = event.target.dataset.articleId;
    if (clickedArticleId) {
      articleId = clickedArticleId;
      const series = document.querySelector('.series-link.active').dataset.series;
      loadArticleContent(series, articleId, selectedLevel);
    }
  });
}

function initReadingLevelPicker(selector, callback) {
  const pickerElement = document.querySelector(selector);
  if (pickerElement) {
    const options = pickerElement.querySelectorAll('.option');
    options.forEach(option => {
      if (option.dataset.level === selectedLevel) {
        option.classList.add('selected');
      }
      option.addEventListener('click', () => {
        options.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedLevel = option.dataset.level;
        const series = document.querySelector('.series-link.active').dataset.series;
        loadArticleContent(series, articleId, selectedLevel);
        callback(selectedLevel);
      });
    });
  } else {
    console.debug("No element: ", selector);
  }
}

function onReadingLevelChange(selectedLevel) {
  console.log('Selected reading level:', selectedLevel);
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
          const filteredArticles = articles.filter(article => article.series === series);
          if (filteredArticles.length > 0) {
            articleId = filteredArticles[0].id;
            return fetchArticleContent(series, articleId, selectedLevel);
          } else {
            throw new Error('No articles found for the selected series.');
          }
        })
        .then(articleContent => {
          displayArticleContent(articleContent);
        })
        .catch(error => {
          console.error('Error:', error);
          displayErrorMessage(errorMessage);
        });
    });
  });
}

function displayArticleContent(articleContent) {
  const articleContentElement = document.getElementById('article-content');
  articleContentElement.innerHTML = '';

  const titleElement = document.createElement('h2');
  titleElement.textContent = articleContent.title;
  articleContentElement.appendChild(titleElement);

  const contentElement = document.createElement('div');
  const formattedContent = articleContent.content.replace(/\n/g, '<br><br>');
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

    // const bookmarkButton = document.createElement('button');
    // bookmarkButton.textContent = 'Bookmark';
    // bookmarkButton.addEventListener('click', () => bookmarkArticle(article));
    // articleElement.appendChild(bookmarkButton);

    articleList.appendChild(articleElement);
  });
}

function displayErrorMessage(message) {
  const articleContentElement = document.getElementById('article-content');
  articleContentElement.innerHTML = `<p class="error-message">${message}</p>`;
}

// function bookmarkArticle(article) {
//   let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
//   if (!bookmarks.some(b => b.id === article.id)) {
//     bookmarks.push(article);
//     localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
//     alert('Article bookmarked!');
//     displayBookmarkedArticles(); // Update the display after bookmarking
//   } else {
//     alert('Article already bookmarked.');
//   }
// }

// function getBookmarkedArticles() {
//   const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
//   console.log('Bookmarked Articles:', bookmarks); // Check the structure
//   return bookmarks;
// }

// function displayBookmarkedArticles() {
//   const bookmarks = getBookmarkedArticles();
//   const bookmarkList = document.getElementById('bookmark-list');
//   bookmarkList.innerHTML = '';

//   bookmarks.forEach(article => {
//     const articleElement = document.createElement('div');
//     articleElement.classList.add('article-item');
//     articleElement.dataset.articleId = article.id;
//     articleElement.textContent = article.title;
//     bookmarkList.appendChild(articleElement);
//   });
// }

// document.addEventListener('DOMContentLoaded', displayBookmarkedArticles);
