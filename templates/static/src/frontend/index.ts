// Live reload for development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  const ws = new WebSocket(`ws://${window.location.host}/livereload`);
  ws.onmessage = () => {
    // Force hard refresh to clear any cached state
    location.reload(true);
  };
  
  // Reconnect on disconnect
  ws.onclose = () => {
    setTimeout(() => {
      location.reload(true);
    }, 1000);
  };
}