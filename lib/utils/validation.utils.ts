export function isFuture(dateString: string): boolean {
  const currDate = new Date(dateString);
  const dateNow = new Date();

  // for setting the due date on the same day
  return currDate.setHours(0, 0, 0, 0) >= dateNow.setHours(0, 0, 0, 0);
}

// for now invalidate years before 1960
export function isValidYear(dateString: string): boolean {
  const date = new Date(dateString);

  return Number(date.getFullYear) < 1960;
}

export const MIN_CHAR = 1;
export const MAX_CHAR = 300;
export const MAX_COLOR_LENGTH = 7;

export const errorMessages = {
  required: (field: string = 'Field') => `${field} is required`,
  invalidType: (field: string = 'Field', type: string) => `${field} must be ${type}`,

  // string validations
  empty: (field: string = 'Field') => `${field} cannot be empty`,

  minChar: (field: string, min: number) => `${field} must be at least ${min} character/s`,
  maxChar: (field: string, max: number) => `${field} must be no more than ${max} characters`,

  // number validations
  positive: (field: string = 'Number') => `${field} must be positive`,
  negative: (field: string = 'Number') => `${field} must be negative`,
  integer: (field: string = 'Number') => `${field} must be a whole number`,

  // format validations
  email: 'Please enter a valid email address',
  url: 'Please enter a valid URL',
  uuid: (field: string) => `${field} must be a valid UUID`,

  // date validations

  // TODO include correct format for time
  invalidDate: (field: string) => `${field} must be in correct date format (YYYY-MM-DD)`,

  // custom patterns
  phonePattern: 'Please enter a valid phone number',
  strongPassword:
    'Password must contain at least 8 characters, including uppercase, lowercase, number and special character',
} as const;
