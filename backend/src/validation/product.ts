import { validationError, type ErrorDetail } from '../errors/httpError.js';
import type { ProductInput } from '../types/product.js';

const ALLOWED_FIELDS = new Set(['name', 'description', 'price', 'quantity']);
const MAX_NAME_LENGTH = 150;
const PRICE_MAX = 9_999_999_999.99;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function decimalPlaces(value: number): number {
  const text = value.toString();

  if (!text.includes('.')) {
    return 0;
  }

  return text.split('.')[1]?.length ?? 0;
}

export function parseProductBody(body: unknown): ProductInput {
  if (!isPlainObject(body)) {
    throw validationError([
      {
        field: 'body',
        code: 'INVALID_TYPE',
        message: 'Request body must be a JSON object.',
      },
    ]);
  }

  const details: ErrorDetail[] = [];
  const extraFields = Object.keys(body).filter((key) => !ALLOWED_FIELDS.has(key));

  if (extraFields.length > 0) {
    for (const field of extraFields) {
      details.push({
        field,
        code: 'UNKNOWN_FIELD',
        message: `Unexpected field "${field}" is not allowed.`,
      });
    }
  }

  const name = parseName(body.name, details);
  const description = parseDescription(body, details);
  const price = parsePrice(body.price, details);
  const quantity = parseQuantity(body.quantity, details);

  if (details.length > 0) {
    throw validationError(details);
  }

  return {
    name,
    description,
    price,
    quantity,
  };
}

function parseName(value: unknown, details: ErrorDetail[]): string {
  if (value === undefined || value === null) {
    details.push({
      field: 'name',
      code: 'REQUIRED',
      message: 'Name is required.',
    });
    return '';
  }

  if (typeof value !== 'string') {
    details.push({
      field: 'name',
      code: 'INVALID_TYPE',
      message: 'Name must be a string.',
    });
    return '';
  }

  const name = value.trim();

  if (name.length === 0) {
    details.push({
      field: 'name',
      code: 'EMPTY',
      message: 'Name must not be empty.',
    });
    return '';
  }

  if (name.length > MAX_NAME_LENGTH) {
    details.push({
      field: 'name',
      code: 'MAX_LENGTH',
      message: `Name must be at most ${MAX_NAME_LENGTH} characters.`,
    });
  }

  return name;
}

function parseDescription(body: Record<string, unknown>, details: ErrorDetail[]): string | null {
  if (!Object.hasOwn(body, 'description') || body.description === undefined || body.description === null) {
    return null;
  }

  if (typeof body.description !== 'string') {
    details.push({
      field: 'description',
      code: 'INVALID_TYPE',
      message: 'Description must be a string or null.',
    });
    return null;
  }

  return body.description;
}

function parsePrice(value: unknown, details: ErrorDetail[]): string {
  if (value === undefined || value === null) {
    details.push({
      field: 'price',
      code: 'REQUIRED',
      message: 'Price is required.',
    });
    return '0.00';
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    details.push({
      field: 'price',
      code: 'INVALID_TYPE',
      message: 'Price must be a finite number.',
    });
    return '0.00';
  }

  if (value <= 0) {
    details.push({
      field: 'price',
      code: 'MIN',
      message: 'Price must be greater than 0.',
    });
  }

  if (decimalPlaces(value) > 2) {
    details.push({
      field: 'price',
      code: 'DECIMAL_PLACES',
      message: 'Price must have at most 2 decimal places.',
    });
  }

  if (value > PRICE_MAX) {
    details.push({
      field: 'price',
      code: 'MAX',
      message: `Price must be at most ${PRICE_MAX.toFixed(2)}.`,
    });
  }

  return value.toFixed(2);
}

function parseQuantity(value: unknown, details: ErrorDetail[]): number {
  if (value === undefined || value === null) {
    details.push({
      field: 'quantity',
      code: 'REQUIRED',
      message: 'Quantity is required.',
    });
    return 0;
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    details.push({
      field: 'quantity',
      code: 'INVALID_TYPE',
      message: 'Quantity must be a finite number.',
    });
    return 0;
  }

  if (!Number.isInteger(value)) {
    details.push({
      field: 'quantity',
      code: 'NOT_INTEGER',
      message: 'Quantity must be an integer.',
    });
    return value;
  }

  if (value < 0) {
    details.push({
      field: 'quantity',
      code: 'MIN',
      message: 'Quantity must be 0 or greater.',
    });
  }

  return value;
}
