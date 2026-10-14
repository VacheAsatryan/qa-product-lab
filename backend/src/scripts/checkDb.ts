import { verifyConnection } from '../config/database.js';
import { env } from '../config/env.js';

async function main(): Promise<void> {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required to verify the database connection.');
  }

  await verifyConnection();
  console.log('Database connection: OK');
}

main().catch((error: unknown) => {
  console.error('Database connection: FAILED');
  console.error(error);
  process.exit(1);
});
