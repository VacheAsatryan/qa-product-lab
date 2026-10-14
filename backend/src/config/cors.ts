import type { CorsOptions } from 'cors';
import { env } from './env.js';

function parseAllowedOrigins(raw: string): string[] | '*' {
  const trimmed = raw.trim();

  if (trimmed === '*') {
    return '*';
  }

  return trimmed
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

export function createCorsOptions(): CorsOptions {
  const allowedOrigins = parseAllowedOrigins(env.corsOrigin);

  return {
    origin(origin, callback) {
      if (allowedOrigins === '*') {
        callback(null, true);
        return;
      }

      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  };
}
