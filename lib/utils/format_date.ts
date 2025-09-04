const locale = undefined;

export function formatDate(date: Date | string) {
  const dateInput = typeof date === 'string' ? new Date(date) : date;

  return dateInput.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// format due date
export function formatDueDate(dueDate?: string | null) {
  if (!dueDate) return 'No due date';

  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} days`;
  } else if (diffDays === 0) {
    return 'Due today';
  } else {
    return `Due in ${diffDays} days`;
  }
}
