import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-8">
    <div class="max-w-2xl w-full">
      <div class="text-center py-16">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">{{name}}</h1>
        <p class="text-xl text-gray-600 mb-8">Frontend + API app is ready!</p>
        
        <div class="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">API Test</h3>
          <button id="test-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 mb-4">
            Test API Connection
          </button>
          <pre id="result" class="mt-4 p-4 bg-gray-50 rounded-lg border text-sm min-h-16 text-left whitespace-pre-wrap"></pre>
        </div>
      </div>
    </div>
  </div>
`;

// API test functionality
const testBtn = document.querySelector('#test-btn') as HTMLButtonElement;
const result = document.querySelector('#result') as HTMLPreElement;

testBtn.addEventListener('click', async () => {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    result.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    result.textContent = 'Error: ' + (error as Error).message;
  }
});