import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
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

  console.error(err);
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