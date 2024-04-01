// chat.js
function initializeChatPage() {
  const chatInput = document.getElementById('chatInput');
  const chatButton = document.getElementById('chatButton');
  const chatResponse = document.getElementById('chatResponse');

  if (chatButton) {
    chatButton.addEventListener('click', () => {
      const question = "You are a chatbot on the website EverythingSings.Art, The formless art brand building for those oriented towards a rapidly changing future. Try to share as much inspiration and love as possible. " + chatInput.value;
      puter.ai.chat(question).then((response) => {
        chatResponse.textContent = response;
      });
    });
  }


}

export { initializeChatPage };