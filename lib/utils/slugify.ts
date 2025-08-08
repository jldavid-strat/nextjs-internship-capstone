//  slug format: [text]-[id] to preserve uniqueness
export function slugify(text: string, projectId: string) {
  const slugText = text
    .toString()
    .toLowerCase()
    .trim()

    // Normalize Unicode characters// Normalize Unicode characters
    .normalize('NFD')

    // Remove diacritics
    .replace(/[\u0300-\u036f]/g, '')

    // Remove invalid characters (keep alphanumeric, spaces, hyphens)
    .replace(/[^a-z0-9\s-]/g, '')

    // Replace spaces with hyphens
    .replace(/\s+/g, '-')

    // Collapse multiple hyphens
    .replace(/-+/g, '-');
  return `${slugText}-${projectId}`;
}
