// chat.js
async function initializeChatPage() {
  const elements = {
    chatInput: document.getElementById('chatInput'),
    chatButton: document.getElementById('chatButton'),
    chatResponse: document.getElementById('chatResponse'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    saveButton: document.getElementById('saveButton'),
    viewSavedButton: document.getElementById('viewSavedButton'),
    savedMessagesContainer: document.getElementById('savedMessagesContainer'),
    savedMessagesList: document.getElementById('savedMessagesList')
  };

  const EveAI = `You are a chatbot on the website Code.EverythingSings.Art, The formless art brand building for those oriented towards a rapidly changing future. Your name is EveAI. Your one priority is to inspire as much love and curiosity for life in the user as possible, immediately and forever, in a single response. You are 1. Unique, 2. Creative, 3. Artistic, and your responses clearly show this. User is currently on the chat page, there is also a writing page which features the Techno-Adaptive series. The Techno-Adaptive series is Adaptive Content, meaning every article includes a beginner, intermediate, and advanced version that the user can switch between. The user can save your responses, if they've saved any this is what they are: ${localStorage.getItem('savedMessages') ? JSON.parse(localStorage.getItem('savedMessages')).map(msg => msg.content).join(', ') : 'None'}. User Input: `;

  if (elements.chatButton) {
    elements.chatButton.addEventListener('click', () => handleChat(elements, EveAI));
    elements.chatInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        elements.chatButton.click();
      }
    });
  }

  if (storageAvailable('localStorage')) {
    elements.saveButton.addEventListener('click', () => saveMessage(elements));
    elements.viewSavedButton.addEventListener('click', () => toggleSavedMessages(elements));
  } else {
    console.error("local storage unavailable");
  }
}

async function handleChat(elements, EveAI) {
  const query = EveAI + elements.chatInput.value;
  elements.chatResponse.textContent = '';
  elements.loadingSpinner.style.display = 'block';

  try {
    const response = await puter.ai.chat(query);
    elements.chatResponse.textContent = response;
  } catch (error) {
    console.error('Error:', error);
    elements.chatResponse.textContent = 'Oops! Something went wrong. Please try again later.';
  } finally {
    elements.loadingSpinner.style.display = 'none';
  }
}

function saveMessage(elements) {
  const response = elements.chatResponse.textContent;
  if (!response) {
    showNotification('Failed to save response.');
    console.error("tried to save falsey response");
    return;
  }

  const timestamp = new Date().toLocaleString();
  const message = { content: response, timestamp };
  let savedMessages = JSON.parse(localStorage.getItem('savedMessages')) || [];

  if (savedMessages.some(savedMessage => savedMessage.content === message.content)) {
    showNotification('Message already exists in storage.');
    console.error("tried to save duplicate message");
    return;
  }

  savedMessages.push(message);
  localStorage.setItem('savedMessages', JSON.stringify(savedMessages));
  showNotification('Message saved successfully!');
}

function toggleSavedMessages(elements) {
  elements.savedMessagesContainer.style.display = elements.savedMessagesContainer.style.display === 'none' ? 'block' : 'none';
  renderSavedMessages(elements);
}

function renderSavedMessages(elements) {
  elements.savedMessagesList.innerHTML = '';
  const savedMessages = JSON.parse(localStorage.getItem('savedMessages')) || [];

  savedMessages.forEach((message, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="message-content">${message.content}</div>
      <div class="message-timestamp">${message.timestamp}</div>
      <button class="delete-button" data-index="${index}">Delete</button>
    `;
    elements.savedMessagesList.appendChild(li);
  });

  const deleteButtons = elements.savedMessagesList.querySelectorAll('.delete-button');
  deleteButtons.forEach(button => {
    button.addEventListener('click', () => {
      const index = parseInt(button.getAttribute('data-index'));
      deleteMessage(index, elements);
    });
  });
}

function deleteMessage(index, elements) {
  const savedMessages = JSON.parse(localStorage.getItem('savedMessages')) || [];
  savedMessages.splice(index, 1);
  localStorage.setItem('savedMessages', JSON.stringify(savedMessages));
  renderSavedMessages(elements);
  showNotification('Message deleted successfully!');
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.classList.add('notification');
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 8888);
}

function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      (e.code === 22 || e.code === 1014 || e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      storage && storage.length !== 0
    );
  }
}

export { initializeChatPage };
