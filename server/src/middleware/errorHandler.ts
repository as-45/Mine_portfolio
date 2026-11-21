import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

function isDuplicateKeyError(err: unknown): err is { keyValue?: Record<string, unknown> } {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === 11000;
}

function hasBodyParserType(err: unknown): err is { type: string } {
  return typeof err === 'object' && err !== null && 'type' in err;
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'The request contains invalid data',
      details: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.code, message: err.message });
    return;
  }

  if (hasBodyParserType(err) && err.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'InvalidJSON', message: 'The request body is not valid JSON' });
    return;
  }

  if (hasBodyParserType(err) && err.type === 'entity.too.large') {
    res.status(413).json({ error: 'PayloadTooLarge', message: 'The request body is too large' });
    return;
  }

  if (isDuplicateKeyError(err)) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    res.status(409).json({ error: 'Conflict', message: `That ${field} is already in use` });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'The data does not match the database rules',
      details: Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })),
    });
    return;
  }

  req.log?.error({ err }, 'Unhandled error');
  res.status(500).json({
    error: 'InternalServerError',
    message: 'Something went wrong on our side',
  });
}

// What it does: it now sorts errors into three types:

// Error type --	Who caused it --	Status --	What the user sees
// ZodError --	User -- sent bad input --	400	-- Which field was wrong and why
// AppError --	Expected problem (e.g. not found) --	Its own code (404...) --	Your clear message
// Anything else --	A real bug --	500 --	Generic message; details only in your terminal
