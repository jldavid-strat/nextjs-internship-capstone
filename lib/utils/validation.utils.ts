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
