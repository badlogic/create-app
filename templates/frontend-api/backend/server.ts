import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || {{apiPort}};

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: '{{name}}-api'
  });
});

// Example API endpoint
app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello from {{name}} API!',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 {{name}} API server running on port ${PORT}`);
});