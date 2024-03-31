// chat.js
function initializeChatPage() {
  const chatInput = document.getElementById('chatInput');
  const chatButton = document.getElementById('chatButton');
  const chatResponse = document.getElementById('chatResponse');

  if (chatButton) {
    chatButton.addEventListener('click', () => {
      const question = chatInput.value;
      puter.ai.chat(question).then((response) => {
        chatResponse.textContent = response;
      });
    });
  }


}

export { initializeChatPage };