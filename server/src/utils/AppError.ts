export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }

  static notFound(message = 'Resource not found') {
    return new AppError(404, 'NotFound', message);
  }

  static badRequest(message = 'Bad request') {
    return new AppError(400, 'BadRequest', message);
  }

    static unauthorized(message = 'You must be logged in') {
    return new AppError(401, 'Unauthorized', message);
  }

    static conflict(message = 'This resource already exists') {
    return new AppError(409, 'Conflict', message);
  }
}