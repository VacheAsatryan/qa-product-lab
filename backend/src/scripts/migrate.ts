import { createPool } from '../config/database.js';
import { env } from '../config/env.js';
import { migrate } from '../db/migrate.js';

async function main(): Promise<void> {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required to run migrations.');
  }

  const pool = createPool(env.databaseUrl);

  try {
    await migrate(pool);
    console.log('Migrations applied successfully.');
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
