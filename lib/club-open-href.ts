export function clubOpenHref(
  title: string,
  author: string | null,
  options?: { guestCookbook?: boolean },
): string {
  const params = new URLSearchParams({ title })
  if (author?.trim()) params.set('author', author.trim())
  if (options?.guestCookbook) params.set('free', 'cookbook')
  return `/books/open?${params.toString()}`
}
