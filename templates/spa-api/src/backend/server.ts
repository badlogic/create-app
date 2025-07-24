import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || {{apiPort}};

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from {{name}} API!' });
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});