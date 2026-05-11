export type AppError = {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown[];
};

export const createError = (code: string, message: string, statusCode: number, details: unknown[] = []): AppError => ({
  code,
  message,
  statusCode,
  details,
});
