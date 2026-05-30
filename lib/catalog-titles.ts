/**
 * Public catalog title when it differs from the Gutenberg metadata title.
 * Search and display use this so "Alice in Wonderland" finds Alice in Wonderland.
 */
export const CATALOG_TITLES_BY_GUTENBERG_ID: Record<number, string> = {
  11: 'Alice in Wonderland',
}

export function catalogTitleForGutenberg(gutenbergId: number, fallbackTitle: string): string {
  return CATALOG_TITLES_BY_GUTENBERG_ID[gutenbergId]?.trim() || fallbackTitle.trim()
}
