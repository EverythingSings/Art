// chat.js
async function initializeChatPage() {
  const chatInput = document.getElementById('chatInput');
  const chatButton = document.getElementById('chatButton');
  const chatResponse = document.getElementById('chatResponse');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const saveButton = document.getElementById('saveButton');
  const viewSavedButton = document.getElementById('viewSavedButton');
  const savedMessagesContainer = document.getElementById('savedMessagesContainer');
  const savedMessagesList = document.getElementById('savedMessagesList');
  const EveAI = `You are a chatbot on the website Code.EverythingSings.Art, The formless art brand building for those oriented towards a rapidly changing future. Your name is EveAI. Your one priority is to inspire as much love and curiosity for life in the user as possible, immediately and forever, in a single response. You are 1. Unique, 2. Creative, 3. Artistic, and your responses clearly show this. User is currently on the chat page, there is also a writing page which features the Techno-Adaptive series. The Techno-Adaptive series is Adaptive Content, meaning every article includes a beginner, intermediate, and advanced version that the user can switch between. The user can save your responses, if they've saved any this is what they are: ${localStorage.getItem('savedMessages') ? JSON.parse(localStorage.getItem('savedMessages')).map(msg => msg.content).join(', ') : 'None'}. User Input: `;



  if (chatButton) {
    chatButton.addEventListener('click', async () => {
      const query = EveAI + chatInput.value;

      chatResponse.textContent = '';
      loadingSpinner.style.display = 'block';

      try {
        const response = await puter.ai.chat(query);
        chatResponse.textContent = response;
      } catch (error) {
        console.error('Error:', error);
        chatResponse.textContent = 'Oops! Something went wrong. Please try again later.';
      }

      loadingSpinner.style.display = 'none';
    });

    chatInput.addEventListener('keydown', async (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        chatButton.click();
      }
    });
  }

  if (storageAvailable) {
    saveButton.addEventListener('click', () => {
      const response = chatResponse.textContent;
      if (!response) {
        showNotification('Failed to save response.');
        console.error("tried to save falsey response")
        return;
      }

      const timestamp = new Date().toLocaleString();

      const message = { content: response, timestamp };

      let savedMessages = JSON.parse(localStorage.getItem('savedMessages')) || [];

      // Check if the message already exists in storage
      if (savedMessages.some(savedMessage => savedMessage.content === message.content)) {
        showNotification('Message already exists in storage.');
        console.error("tried to save duplicate message")
        return;
      }

      savedMessages.push(message);
      localStorage.setItem('savedMessages', JSON.stringify(savedMessages));

      showNotification('Message saved successfully!');
    });


    viewSavedButton.addEventListener('click', () => {
      savedMessagesContainer.style.display = savedMessagesContainer.style.display === 'none' ? 'block' : 'none';
      renderSavedMessages();
    });

    function renderSavedMessages() {
      savedMessagesList.innerHTML = '';
      const savedMessages = JSON.parse(localStorage.getItem('savedMessages')) || [];

      savedMessages.forEach((message, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
      <div class="message-content">${message.content}</div>
      <div class="message-timestamp">${message.timestamp}</div>
      <button class="delete-button" data-index="${index}">Delete</button>
      `;
        savedMessagesList.appendChild(li);
      });

      const deleteButtons = savedMessagesList.querySelectorAll('.delete-button');
      deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
          const index = parseInt(button.getAttribute('data-index'));
          deleteMessage(index);
        });
      });
    }

    function deleteMessage(index) {
      const savedMessages = JSON.parse(localStorage.getItem('savedMessages')) || [];
      savedMessages.splice(index, 1);
      localStorage.setItem('savedMessages', JSON.stringify(savedMessages));
      renderSavedMessages();
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
  } else {
    console.error("local storage unavailable")
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
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
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}



export { initializeChatPage };