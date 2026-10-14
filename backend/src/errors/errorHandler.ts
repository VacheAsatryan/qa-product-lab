import type { NextFunction, Request, Response } from 'express';
import { DatabaseError } from 'pg';
import { HttpError } from './httpError.js';

type ErrorBody = {
  error: {
    code: string;
    message: string;
    details: { field: string; code: string; message: string }[];
  };
};

function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details: ErrorBody['error']['details'] = [],
): void {
  const body: ErrorBody = {
    error: {
      code,
      message,
      details,
    },
  };

  res.status(status).json(body);
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    sendError(res, err.status, err.code, err.message, err.details);
    return;
  }

  if (err instanceof SyntaxError) {
    sendError(res, 400, 'INVALID_JSON', 'Malformed JSON in request body.');
    return;
  }

  if (err instanceof DatabaseError) {
    if (err.code === '23505') {
      sendError(res, 409, 'CONFLICT', 'The request conflicts with an existing resource.');
      return;
    }

    if (err.code === '23514') {
      sendError(res, 400, 'CONSTRAINT_VIOLATION', 'The request violates a database constraint.');
      return;
    }

    sendError(res, 500, 'DATABASE_ERROR', 'A database error occurred.');
    return;
  }

  console.error(err);
  sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
}
