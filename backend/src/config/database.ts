import { Pool } from 'pg';
import { env, type DatabaseSslMode } from './env.js';

let pool: Pool | null = null;

function inferSslMode(databaseUrl: string): DatabaseSslMode {
  if (env.databaseSsl) {
    return env.databaseSsl;
  }

  try {
    const url = new URL(databaseUrl);
    const sslmode = url.searchParams.get('sslmode')?.toLowerCase();
    const host = url.hostname;

    if (sslmode === 'disable') {
      return 'disable';
    }

    if (sslmode === 'no-verify') {
      return 'no-verify';
    }

    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
      return 'disable';
    }

    if (
      sslmode === 'require' ||
      sslmode === 'verify-ca' ||
      sslmode === 'verify-full' ||
      host.endsWith('.neon.tech')
    ) {
      return 'require';
    }
  } catch {
    return 'disable';
  }

  return 'disable';
}

export function sslOptions(databaseUrl: string): false | { rejectUnauthorized: boolean } {
  const mode = inferSslMode(databaseUrl);

  if (mode === 'disable') {
    return false;
  }

  if (mode === 'no-verify') {
    return { rejectUnauthorized: false };
  }

  return { rejectUnauthorized: true };
}

export function createPool(databaseUrl: string): Pool {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured');
  }

  return new Pool({
    connectionString: databaseUrl,
    ssl: sslOptions(databaseUrl),
  });
}

export function getPool(): Pool {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is not configured');
  }

  if (pool === null) {
    pool = createPool(env.databaseUrl);
  }

  return pool;
}

export async function closePool(): Promise<void> {
  if (pool !== null) {
    await pool.end();
    pool = null;
  }
}

export async function verifyConnection(databaseUrl = env.databaseUrl): Promise<void> {
  const clientPool = databaseUrl === env.databaseUrl ? getPool() : createPool(databaseUrl);

  try {
    await clientPool.query('SELECT 1');
  } finally {
    if (clientPool !== pool) {
      await clientPool.end();
    }
  }
}
