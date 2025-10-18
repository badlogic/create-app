import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as fs from 'node:fs';
import type { Api } from '../shared/api.js';
import type { HealthResponse, HelloResponse } from '../shared/types.js';
import { createApiRouter } from './api-server.js';

const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const DATA_DIR = process.env.DATA_DIR || './data';
const isDevelopment = process.env.NODE_ENV !== 'production';

// Create data directory if it doesn't exist
fs.mkdirSync(DATA_DIR, { recursive: true });

// Create API handlers
const handlers: Api = {
  health: async (): Promise<HealthResponse> => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  },
  hello: async (): Promise<HelloResponse> => {
    return {
      message: 'Hello from {{name}} API!'
    };
  }
};

const app = express();

app.use(cors());
app.use(express.json());

// Auto-generated API routes
const apiRouter = express.Router();
createApiRouter(apiRouter, handlers);
app.use('/api', apiRouter);

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

app.listen(PORT, () => {
  console.log(`✓ Server listening on port ${PORT}`);
  console.log(`  API: http://localhost:${PORT}/api`);
  console.log(`  Data: ${DATA_DIR}`);
});
