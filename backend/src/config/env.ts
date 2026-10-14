import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(backendRoot, '.env') });

export type DatabaseSslMode = 'disable' | 'require' | 'no-verify';

function readEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parseSslMode(raw: string | undefined): DatabaseSslMode | undefined {
  if (!raw || raw.trim() === '') {
    return undefined;
  }

  const value = raw.trim().toLowerCase();

  if (value === 'disable' || value === 'require' || value === 'no-verify') {
    return value;
  }

  throw new Error('DATABASE_SSL must be one of: disable, require, no-verify');
}

export const env = {
  nodeEnv: readEnv('NODE_ENV', 'development'),
  port: Number.parseInt(readEnv('PORT', '4000'), 10),
  corsOrigin: readEnv('CORS_ORIGIN', 'http://localhost:5173'),
  databaseUrl: process.env.DATABASE_URL?.trim() ?? '',
  databaseUrlTest: process.env.DATABASE_URL_TEST?.trim() ?? '',
  databaseSsl: parseSslMode(process.env.DATABASE_SSL),
};

if (Number.isNaN(env.port) || env.port <= 0) {
  throw new Error('PORT must be a positive number');
}
