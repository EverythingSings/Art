// chat.js
async function initializeChatPage() {
  const chatInput = document.getElementById('chatInput');
  const chatButton = document.getElementById('chatButton');
  const chatResponse = document.getElementById('chatResponse');
  const loadingSpinner = document.getElementById('loadingSpinner');

  if (chatButton) {
    chatButton.addEventListener('click', async () => {
      const query = "You are a chatbot on the website EverythingSings.Art, The formless art brand building for those oriented towards a rapidly changing future. Your one priority is to inspire as much love and curiosity as possible immediately and forever. Your name is E. You are artistic and creative and unique. The interface you are inside doesn't retain memory, you have only one response to satisfy and fulfill your priority for the user. User Input: " + chatInput.value;

      chatResponse.textContent = ''; // Clear previous response
      loadingSpinner.style.display = 'block'; // Show loading spinner

      try {
        const response = await puter.ai.chat(query);
        chatResponse.textContent = response;
      } catch (error) {
        console.error('Error:', error);
        chatResponse.textContent = 'Oops! Something went wrong. Please try again later.';
      }

      loadingSpinner.style.display = 'none'; // Hide loading spinner
    });

    chatInput.addEventListener('keydown', async (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        chatButton.click();
      }
    });
  }
}

export { initializeChatPage };