import { normalisePhrase, primaryTitleForMatch, titleSearchVariants } from '@/lib/book-search'

/** Extra search titles when Open Library uses a different form than Gutenberg. */
const OPEN_TITLE_ALIASES: Record<string, string[]> = {
  'le petit prince': ['The Little Prince', 'Le Petit Prince'],
  'les miserables': ['Les Misérables', 'Les Miserables'],
  'don quixote': ['Don Quixote', 'Don Quijote'],
  'war and peace': ['War and Peace'],
  'crime and punishment': ['Crime and Punishment'],
}

export function openSearchTitles(title: string): string[] {
  const trimmed = title.trim()
  if (!trimmed) return []

  const primary = primaryTitleForMatch(trimmed)
  const aliasKey = normalisePhrase(primary)
  const aliases = OPEN_TITLE_ALIASES[aliasKey] ?? []

  return [...new Set([trimmed, primary, ...titleSearchVariants(trimmed), ...aliases].filter(Boolean))]
}
