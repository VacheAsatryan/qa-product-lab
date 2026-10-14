import assert from 'node:assert/strict';
import { createServer, type AddressInfo } from 'node:http';
import { after, afterEach, before, beforeEach, test } from 'node:test';
import type { Express } from 'express';
import type { Pool } from 'pg';
import { createApp } from '../src/app.js';
import { createPool } from '../src/config/database.js';
import { env } from '../src/config/env.js';
import { migrate } from '../src/db/migrate.js';

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

const validProduct = {
  name: 'USB Keyboard',
  description: 'Wired keyboard for the lab',
  price: 29.99,
  quantity: 10,
};

function requireTestDatabaseUrl(): string {
  const url = env.databaseUrlTest;

  if (!url) {
    throw new Error(
      'DATABASE_URL_TEST is not set. Integration tests require an isolated PostgreSQL database whose name contains "test".',
    );
  }

  if (env.databaseUrl && url === env.databaseUrl) {
    throw new Error('DATABASE_URL_TEST must be different from DATABASE_URL.');
  }

  const databaseName = new URL(url).pathname.replace(/^\//, '');

  if (!databaseName.toLowerCase().includes('test')) {
    throw new Error(
      `Refusing to run tests against database "${databaseName}". The test database name must contain "test".`,
    );
  }

  return url;
}

function listen(app: Express): Promise<{ server: ReturnType<typeof createServer>; baseUrl: string }> {
  const server = createServer(app);

  return new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address() as AddressInfo;
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` });
    });
    server.on('error', reject);
  });
}

let pool: Pool;
let baseUrl: string;
let server: ReturnType<typeof createServer>;

before(async () => {
  const databaseUrl = requireTestDatabaseUrl();
  pool = createPool(databaseUrl);
  await pool.query('SELECT 1');
  await migrate(pool);
  const started = await listen(createApp(pool));
  server = started.server;
  baseUrl = started.baseUrl;
});

beforeEach(async () => {
  await pool.query('TRUNCATE TABLE products');
});

afterEach(async () => {
  await pool.query('TRUNCATE TABLE products');
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
  await pool.end();
});

async function api(
  method: string,
  path: string,
  options: { body?: unknown; headers?: Record<string, string>; rawBody?: string } = {},
): Promise<{ status: number; headers: Headers; json: JsonValue | undefined; text: string }> {
  const headers = new Headers(options.headers);

  let body: string | undefined;

  if (options.rawBody !== undefined) {
    body = options.rawBody;
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  } else if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${baseUrl}${path}`, { method, headers, body });
  const text = await response.text();
  let json: JsonValue | undefined;

  if (text.length > 0) {
    json = JSON.parse(text) as JsonValue;
  }

  return { status: response.status, headers: response.headers, json, text };
}

function errorCode(json: JsonValue | undefined): string {
  assert.ok(json && typeof json === 'object' && !Array.isArray(json));
  const error = json.error;
  assert.ok(error && typeof error === 'object' && !Array.isArray(error));
  assert.equal(typeof error.code, 'string');
  return error.code;
}

test('GET /health returns ok', async () => {
  const response = await api('GET', '/health');
  assert.equal(response.status, 200);
  assert.deepEqual(response.json, { status: 'ok' });
});

test('GET /api/products returns an empty array when no products exist', async () => {
  const response = await api('GET', '/api/products');
  assert.equal(response.status, 200);
  assert.deepEqual(response.json, []);
});

test('POST /api/products creates a product and GET returns it in created order', async () => {
  const first = await api('POST', '/api/products', {
    body: validProduct,
  });
  const second = await api('POST', '/api/products', {
    body: { name: 'Mouse', description: null, price: 15, quantity: 0 },
  });

  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.ok(first.json && typeof first.json === 'object' && !Array.isArray(first.json));
  assert.equal(first.json.name, 'USB Keyboard');
  assert.equal(first.json.price, '29.99');
  assert.equal(first.json.quantity, 10);

  const list = await api('GET', '/api/products');
  assert.equal(list.status, 200);
  assert.ok(Array.isArray(list.json));
  assert.equal(list.json.length, 2);
  assert.ok(list.json[0] && typeof list.json[0] === 'object');
  assert.ok(list.json[1] && typeof list.json[1] === 'object');
  assert.equal(list.json[0].name, 'USB Keyboard');
  assert.equal(list.json[1].name, 'Mouse');
});

test('PUT /api/products/:id updates an existing product', async () => {
  const created = await api('POST', '/api/products', { body: validProduct });
  assert.ok(created.json && typeof created.json === 'object' && !Array.isArray(created.json));
  const id = created.json.id;
  assert.equal(typeof id, 'string');

  const updated = await api('PUT', `/api/products/${id}`, {
    body: {
      name: 'Wireless Keyboard',
      description: 'Updated',
      price: 39.5,
      quantity: 4,
    },
  });

  assert.equal(updated.status, 200);
  assert.ok(updated.json && typeof updated.json === 'object' && !Array.isArray(updated.json));
  assert.equal(updated.json.name, 'Wireless Keyboard');
  assert.equal(updated.json.price, '39.50');
  assert.equal(updated.json.quantity, 4);
  assert.equal(updated.json.description, 'Updated');
});

test('DELETE /api/products/:id removes a product and returns 204', async () => {
  const created = await api('POST', '/api/products', { body: validProduct });
  assert.ok(created.json && typeof created.json === 'object' && !Array.isArray(created.json));
  const id = created.json.id;

  const deleted = await api('DELETE', `/api/products/${id}`);
  assert.equal(deleted.status, 204);
  assert.equal(deleted.text, '');

  const missing = await api('GET', '/api/products');
  assert.deepEqual(missing.json, []);
});

test('POST rejects missing required fields', async () => {
  const response = await api('POST', '/api/products', { body: {} });
  assert.equal(response.status, 400);
  assert.equal(errorCode(response.json), 'VALIDATION_ERROR');
});

test('POST rejects an empty product name', async () => {
  const response = await api('POST', '/api/products', {
    body: { ...validProduct, name: '   ' },
  });
  assert.equal(response.status, 400);
  assert.equal(errorCode(response.json), 'VALIDATION_ERROR');
});

test('POST rejects a name longer than 150 characters', async () => {
  const response = await api('POST', '/api/products', {
    body: { ...validProduct, name: 'A'.repeat(151) },
  });
  assert.equal(response.status, 400);
  assert.equal(errorCode(response.json), 'VALIDATION_ERROR');
});

test('POST accepts a name of exactly 150 characters', async () => {
  const response = await api('POST', '/api/products', {
    body: { ...validProduct, name: 'A'.repeat(150) },
  });
  assert.equal(response.status, 201);
});

test('POST rejects zero and negative prices', async () => {
  const zero = await api('POST', '/api/products', { body: { ...validProduct, price: 0 } });
  const negative = await api('POST', '/api/products', { body: { ...validProduct, price: -1 } });
  assert.equal(zero.status, 400);
  assert.equal(negative.status, 400);
  assert.equal(errorCode(zero.json), 'VALIDATION_ERROR');
  assert.equal(errorCode(negative.json), 'VALIDATION_ERROR');
});

test('POST accepts the lowest valid price 0.01', async () => {
  const response = await api('POST', '/api/products', { body: { ...validProduct, price: 0.01 } });
  assert.equal(response.status, 201);
  assert.ok(response.json && typeof response.json === 'object' && !Array.isArray(response.json));
  assert.equal(response.json.price, '0.01');
});

test('POST rejects a price with more than 2 decimal places', async () => {
  const response = await api('POST', '/api/products', { body: { ...validProduct, price: 1.239 } });
  assert.equal(response.status, 400);
  assert.equal(errorCode(response.json), 'VALIDATION_ERROR');
});

test('POST rejects a negative quantity', async () => {
  const response = await api('POST', '/api/products', { body: { ...validProduct, quantity: -1 } });
  assert.equal(response.status, 400);
  assert.equal(errorCode(response.json), 'VALIDATION_ERROR');
});

test('POST rejects a decimal quantity', async () => {
  const response = await api('POST', '/api/products', { body: { ...validProduct, quantity: 1.5 } });
  assert.equal(response.status, 400);
  assert.equal(errorCode(response.json), 'VALIDATION_ERROR');
});

test('POST rejects invalid data types', async () => {
  const response = await api('POST', '/api/products', {
    body: { name: 123, description: true, price: '9.99', quantity: '1' },
  });
  assert.equal(response.status, 400);
  assert.equal(errorCode(response.json), 'VALIDATION_ERROR');
});

test('POST rejects unexpected request fields', async () => {
  const response = await api('POST', '/api/products', {
    body: { ...validProduct, sku: 'ABC' },
  });
  assert.equal(response.status, 400);
  assert.equal(errorCode(response.json), 'VALIDATION_ERROR');
});

test('POST rejects malformed JSON', async () => {
  const response = await api('POST', '/api/products', { rawBody: '{"name":' });
  assert.equal(response.status, 400);
  assert.equal(errorCode(response.json), 'INVALID_JSON');
});

test('PUT and DELETE reject an invalid UUID', async () => {
  const put = await api('PUT', '/api/products/not-a-uuid', { body: validProduct });
  const del = await api('DELETE', '/api/products/not-a-uuid');
  assert.equal(put.status, 400);
  assert.equal(del.status, 400);
  assert.equal(errorCode(put.json), 'INVALID_UUID');
  assert.equal(errorCode(del.json), 'INVALID_UUID');
});

test('PUT and DELETE return 404 for a nonexistent product', async () => {
  const missingId = '11111111-1111-4111-8111-111111111111';
  const put = await api('PUT', `/api/products/${missingId}`, { body: validProduct });
  const del = await api('DELETE', `/api/products/${missingId}`);
  assert.equal(put.status, 404);
  assert.equal(del.status, 404);
  assert.equal(errorCode(put.json), 'PRODUCT_NOT_FOUND');
  assert.equal(errorCode(del.json), 'PRODUCT_NOT_FOUND');
});

test('PUT rejects an incomplete request body', async () => {
  const created = await api('POST', '/api/products', { body: validProduct });
  assert.ok(created.json && typeof created.json === 'object' && !Array.isArray(created.json));
  const id = created.json.id;

  const response = await api('PUT', `/api/products/${id}`, {
    body: { name: 'Only name' },
  });
  assert.equal(response.status, 400);
  assert.equal(errorCode(response.json), 'VALIDATION_ERROR');
});
