/** Titles matching the free public cookbooks shelf (guests may open these). */
export function isGuestFreeCookbook(book: {
  title?: string | null
  subcategory?: string | null
}): boolean {
  if (book.subcategory === 'cooking') return true

  const title = (book.title ?? '').toLowerCase()
  if (!title) return false

  return (
    title.includes('cookery') ||
    title.includes('cook book') ||
    title.includes('cookbook') ||
    title.includes('kitchen') ||
    title.includes('culinary') ||
    title.includes('gastronom') ||
    title.includes('domestic economy') ||
    title.includes('cooking') ||
    title.includes('recipe')
  )
}
