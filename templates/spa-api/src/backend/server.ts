import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || {{apiPort}};
const isDevelopment = process.env.NODE_ENV !== 'production';

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from {{name}} API!' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);
  
  const status = (err as any).status || 500;
  const message = isDevelopment ? err.message : 'Internal server error';
  
  res.status(status).json({
    error: message,
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(port, () => {
  console.log(`API server running on port ${port} in ${isDevelopment ? 'development' : 'production'} mode`);
});