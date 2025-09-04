const locale = undefined;

export function formatDate(date: Date | string) {
  const dateInput = typeof date === 'string' ? new Date(date) : date;

  return dateInput.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
