// chat.js
async function initializeChatPage() {
  const chatInput = document.getElementById('chatInput');
  const chatButton = document.getElementById('chatButton');
  const chatResponse = document.getElementById('chatResponse');

  if (chatButton) {
    chatButton.addEventListener('click', async () => {
      const prompt = "You are a chatbot on the website EverythingSings.Art, The formless art brand building for those oriented towards a rapidly changing future. Try to share as much inspiration and love as possible. User Message:" + chatInput.value;

      try {
        const response = await puter.ai.chat(prompt);
        chatResponse.textContent = response;
      } catch (error) {
        console.error('Error:', error);
        chatResponse.textContent = 'Oops! Something went wrong. Please try again later.';
      }
    });
  }
}

export { initializeChatPage };