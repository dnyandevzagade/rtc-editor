const editor = document.getElementById('editor');
const socket = new WebSocket('ws://localhost:3000');
let userColor = '#000000';

// Handle incoming messages
socket.onmessage = async (event) => {
  try {
    const data = JSON.parse(
      event.data instanceof Blob ? 
      await event.data.text() : 
      event.data
    );

    switch(data.type) {
      case 'init':
        editor.innerHTML = data.content;
        userColor = data.color;
        document.documentElement.style.setProperty('--user-color', userColor);
        break;
        
      case 'update':
        editor.innerHTML = data.content;
        break;
    }
  } catch (err) {
    console.error('Message error:', err);
  }
};

// Send changes with debounce
let timeout;
editor.addEventListener('input', () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'content',
        content: editor.innerHTML
      }));
    }
  }, 200);
});

// Connection status
socket.onopen = () => console.log("Connected to server");
socket.onerror = (err) => console.error("WebSocket error:", err);