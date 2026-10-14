import { HttpError } from '../errors/httpError.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function assertUuid(value: unknown): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new HttpError(400, 'INVALID_UUID', 'The product id must be a valid UUID.', [
      {
        field: 'id',
        code: 'INVALID_UUID',
        message: 'The product id must be a valid UUID.',
      },
    ]);
  }

  return value.toLowerCase();
}
