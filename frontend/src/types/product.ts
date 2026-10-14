export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  name: string;
  description: string | null;
  price: number;
  quantity: number;
}

export interface ApiErrorDetail {
  field: string;
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details: ApiErrorDetail[];
  };
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiErrorDetail[];

  constructor(status: number, code: string, message: string, details: ApiErrorDetail[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
