import { AppError } from "../errors/AppError";

export function errorHandler(err: unknown, _req: any, res: any, _next: any) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  console.error(err);
  return res.status(500).json({
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
  });
}
