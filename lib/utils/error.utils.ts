import { ZodError } from 'zod';

export function getErrorMessage(error: unknown): string | string[] {
  if (error instanceof ZodError) {
    console.log(
      'Zod Error',
      error.issues.map((issue) => issue.message),
    );
    return error.issues.map((issue) => issue.message);
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }

  return 'An unknown error occurred';
}
