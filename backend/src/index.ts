import { createApp } from './app.js';
import { closePool, getPool, verifyConnection } from './config/database.js';
import { env } from './config/env.js';

async function main(): Promise<void> {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required. Copy backend/.env.example to backend/.env and set it.');
  }

  await verifyConnection();
  console.log('PostgreSQL connected');

  const app = createApp(getPool());

  const server = app.listen(env.port, '0.0.0.0', () => {
    console.log(`QA Product Lab API listening on http://0.0.0.0:${env.port}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${env.port} is already in use. Set PORT in backend/.env to a free port.`);
    } else {
      console.error(error);
    }

    process.exit(1);
  });

  const shutdown = async () => {
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => {
    void shutdown();
  });
  process.on('SIGTERM', () => {
    void shutdown();
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
