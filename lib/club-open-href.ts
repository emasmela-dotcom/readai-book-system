export function clubOpenHref(title: string, author: string | null): string {
  const params = new URLSearchParams({ title })
  if (author?.trim()) params.set('author', author.trim())
  return `/books/open?${params.toString()}`
}
