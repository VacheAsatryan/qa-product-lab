import cors from 'cors';
import express from 'express';
import type { Pool } from 'pg';
import { createCorsOptions } from './config/cors.js';
import { errorHandler } from './errors/errorHandler.js';
import { ProductRepository } from './repositories/productRepository.js';
import { createProductRouter } from './routes/products.js';

export function createApp(pool: Pool): express.Express {
  const app = express();

  app.use(cors(createCorsOptions()));
  app.use(express.json({ limit: '32kb' }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  const repository = new ProductRepository(pool);
  app.use('/api/products', createProductRouter(repository));

  app.use(errorHandler);

  return app;
}
