document.addEventListener('DOMContentLoaded', () => {
  const messageInput = document.getElementById('message');
  const sendButton = document.getElementById('send-button');

  messageInput.focus();
  addWelcomeMessage();

  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && messageInput.value.trim() !== '') {
      sendMessage();
    }
  });

  sendButton.addEventListener('click', () => {
    if (messageInput.value.trim() !== '') sendMessage();
  });

  sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
});

function addWelcomeMessage() {
  const welcomeSuggestions = [
    "Explain quantum computing in simple terms",
    "Help me debug this Python code",
    "Give me ideas for a birthday party",
    "Write a poem about artificial intelligence"
  ];

  const chatBox = document.getElementById("chat-box");
  const welcomeContainer = document.createElement("div");
  welcomeContainer.classList.add("ai-message", "message");

  let buttonsHTML = welcomeSuggestions.map((text, i) => 
    `<button class="suggestion-btn" style="animation-delay:${i * 0.1}s">${text}</button>`
  ).join('');

  welcomeContainer.innerHTML = `
    <div class="welcome-message">
      <p>Hello! I'm your AI assistant. Ask me anything and I'll do my best to help.</p>
      <div class="suggestion-buttons">${buttonsHTML}</div>
    </div>
  `;
  chatBox.appendChild(welcomeContainer);

  welcomeContainer.querySelectorAll(".suggestion-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("message").value = btn.textContent;
      sendMessage();
    });
  });
}

async function sendMessage() {
  const input = document.getElementById('message');
  const chatBox = document.getElementById('chat-box');
  const userMsg = input.value.trim();

  if (!userMsg) return;

  // Add user message to chat
  const userMessageDiv = document.createElement('div');
  userMessageDiv.className = 'user-message message';
  userMessageDiv.innerHTML = `
    <div class="message-content">
      <p>${userMsg}</p>
    </div>
    <div class="message-time">${getCurrentTime()}</div>
  `;
  chatBox.appendChild(userMessageDiv);
  input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  // Add typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  chatBox.appendChild(typingIndicator);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    // Call your Flask API
    const response = await fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMsg,
        conversation_id: localStorage.getItem('conversation_id') || null
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    // Remove typing indicator
    chatBox.removeChild(typingIndicator);

    // Save conversation ID to continue chat in future
    if (data.conversation_id) {
      localStorage.setItem('conversation_id', data.conversation_id);
    }

    // Add assistant reply
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'bot-message message';
    botMessageDiv.innerHTML = `
      <div class="message-content">
        <p>${data.reply}</p>
      </div>
      <div class="message-time">${getCurrentTime()}</div>
    `;
    chatBox.appendChild(botMessageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

  } catch (error) {
    chatBox.removeChild(typingIndicator);
    const errorMessageDiv = document.createElement('div');
    errorMessageDiv.className = 'bot-message message';
    errorMessageDiv.innerHTML = `
      <div class="message-content">
        <p>Sorry, I'm having trouble connecting to the server. Please try again later.</p>
      </div>
    `;
    chatBox.appendChild(errorMessageDiv);
    console.error('Error:', error);
  }
}

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// script.js

const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send-button');
const newChatBtn = document.getElementById('new-chat-btn');

// Function to create a chat message element
function createMessageElement(message, sender) {
  const messageElem = document.createElement('div');
  messageElem.classList.add('message');
  messageElem.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
  // Use marked to render markdown safely
  messageElem.innerHTML = marked.parse(message);
  return messageElem;
}

// Function to scroll chat to bottom
function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Show bot typing indicator
function showTypingIndicator() {
  const typingElem = document.createElement('div');
  typingElem.classList.add('message', 'bot-message', 'typing-indicator');
  typingElem.id = 'typing-indicator';
  typingElem.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
  `;
  chatBox.appendChild(typingElem);
  scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
  const typingElem = document.getElementById('typing-indicator');
  if (typingElem) {
    chatBox.removeChild(typingElem);
  }
}

// Send message handler
async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  // Add user message to chat
  const userMsgElem = createMessageElement(message, 'user');
  chatBox.appendChild(userMsgElem);
  scrollToBottom();

  messageInput.value = '';
  messageInput.focus();

  // Show typing indicator
  showTypingIndicator();

  try {
    // Call backend API - update URL if needed
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    removeTypingIndicator();

    if (data && data.response) {
      const botMsgElem = createMessageElement(data.response, 'bot');
      chatBox.appendChild(botMsgElem);
      scrollToBottom();
    } else {
      throw new Error('Invalid response data');
    }
  } catch (error) {
    removeTypingIndicator();
    const errorElem = createMessageElement('Error: Could not get response from AI assistant.', 'bot');
    chatBox.appendChild(errorElem);
    scrollToBottom();
    console.error('Error:', error);
  }
}

// Clear chat for new conversation
function newChat() {
  chatBox.innerHTML = '';
  messageInput.value = '';
  messageInput.focus();
}

// Event listeners
sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

newChatBtn.addEventListener('click', newChat);

// Focus on input when page loads
messageInput.focus();
