import { ApiError, type ApiErrorResponse, type Product, type ProductInput } from '../types/product';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/+$/, '');

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const text = await response.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = undefined;
  }

  if (!response.ok) {
    if (json && typeof json === 'object' && 'error' in json) {
      const errRes = json as ApiErrorResponse;
      throw new ApiError(
        response.status,
        errRes.error.code,
        errRes.error.message,
        errRes.error.details || []
      );
    }
    throw new ApiError(
      response.status,
      'UNKNOWN_ERROR',
      text || `Request failed with status ${response.status}`
    );
  }

  return json as T;
}

export const productService = {
  async getAll(): Promise<Product[]> {
    const res = await fetch(`${API_BASE_URL}/api/products`);
    return handleResponse<Product[]>(res);
  },

  async create(input: ProductInput): Promise<Product> {
    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    return handleResponse<Product>(res);
  },

  async update(id: string, input: ProductInput): Promise<Product> {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    return handleResponse<Product>(res);
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(res);
  },
};
