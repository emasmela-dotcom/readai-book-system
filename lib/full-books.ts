/** Books with a complete readable source that can be fetched live from Gutenberg. */

export const FULL_TEXT_MIN_LENGTH = 25000

export function hasReadableBookSource(book: {
  gutenberg_id?: number | null
}): boolean {
  return typeof book.gutenberg_id === 'number'
}
