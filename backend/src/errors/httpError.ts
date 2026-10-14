export type ErrorDetail = {
  field: string;
  code: string;
  message: string;
};

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ErrorDetail[];

  constructor(status: number, code: string, message: string, details: ErrorDetail[] = []) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function validationError(details: ErrorDetail[]): HttpError {
  return new HttpError(400, 'VALIDATION_ERROR', 'Request validation failed.', details);
}
