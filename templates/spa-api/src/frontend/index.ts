// API client functions
async function callAPI(endpoint: string): Promise<any> {
  try {
    const response = await fetch(`/api${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// UI helper functions
function showResponse(data: any) {
  const responseDiv = document.getElementById('response')!;
  const responseContent = document.getElementById('responseContent')!;
  const errorDiv = document.getElementById('error')!;
  
  responseContent.textContent = JSON.stringify(data, null, 2);
  responseDiv.classList.remove('hidden');
  errorDiv.classList.add('hidden');
}

function showError(error: Error) {
  const responseDiv = document.getElementById('response')!;
  const errorDiv = document.getElementById('error')!;
  const errorContent = document.getElementById('errorContent')!;
  
  errorContent.textContent = error.message;
  errorDiv.classList.remove('hidden');
  responseDiv.classList.add('hidden');
}

// Event handlers
async function handleHealthCheck() {
  try {
    const data = await callAPI('/health');
    showResponse(data);
  } catch (error) {
    showError(error as Error);
  }
}

async function handleHello() {
  try {
    const data = await callAPI('/hello');
    showResponse(data);
  } catch (error) {
    showError(error as Error);
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  const healthButton = document.getElementById('healthCheck')!;
  const helloButton = document.getElementById('helloButton')!;
  
  healthButton.addEventListener('click', handleHealthCheck);
  helloButton.addEventListener('click', handleHello);
});

// Live reload for development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  const ws = new WebSocket(`ws://${window.location.host}/livereload`);
  ws.onmessage = () => {
    // Force hard refresh to clear any cached state
    location.reload();
  };
  
  // Reconnect on disconnect with exponential backoff
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  
  ws.onclose = () => {
    if (reconnectAttempts < maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
      reconnectAttempts++;
      
      setTimeout(() => {
        location.reload();
      }, delay);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}