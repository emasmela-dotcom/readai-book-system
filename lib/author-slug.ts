/** URL slug for an author display name (matches Neon `author` via resolve on author pages). */

export function authorToSlug(author: string): string {
  return author
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function authorHref(author: string | null | undefined): string | null {
  if (!author?.trim()) return null
  const slug = authorToSlug(author)
  return slug ? `/authors/${slug}` : null
}
