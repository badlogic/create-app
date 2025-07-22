// Live reload for development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  const ws = new WebSocket(`ws://${window.location.host}/livereload`);
  ws.onmessage = () => location.reload();
}