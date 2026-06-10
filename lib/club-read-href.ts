/** Only in-club reader URLs are valid for paid read flows — never external sites. */
export function clubReadHrefOnly(
  href: string | null | undefined,
  inClub: boolean,
): string | null {
  if (!inClub) return null
  const trimmed = href?.trim()
  if (!trimmed?.startsWith('/books/') || !trimmed.endsWith('/read')) return null
  return trimmed
}
