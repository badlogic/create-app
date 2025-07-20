(() => {
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    const ws = new WebSocket('ws://localhost:35729');
    ws.onmessage = () => {
      location.reload();
    };
  }
})();