/** Words that should not drive matches on their own. */
const STOPWORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'of',
  'in',
  'on',
  'at',
  'to',
  'for',
  'by',
  'with',
  'from',
  'as',
  'is',
  'it',
  'its',
])

export function tokeniseSearch(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 2 && !STOPWORDS.has(token))
    .slice(0, 8)
}

export function parseTitleAuthorQuery(raw: string): {
  titlePart: string
  authorPart: string
  isTitleByAuthor: boolean
} {
  const trimmed = raw.trim()
  const bySplit = trimmed.split(/\s+by\s+/i)
  const isTitleByAuthor = bySplit.length >= 2
  const titlePart = isTitleByAuthor ? bySplit.slice(0, -1).join(' by ') : trimmed
  const authorPart = isTitleByAuthor ? bySplit[bySplit.length - 1] : trimmed

  return { titlePart, authorPart, isTitleByAuthor }
}

export function normalisePhrase(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function exactPhraseVariants(raw: string): string[] {
  const normalised = normalisePhrase(raw)
  const tokens = tokeniseSearch(raw)
  const variants = new Set<string>()

  if (normalised) variants.add(normalised)
  if (tokens.length >= 2) variants.add(tokens.join(' '))
  if (tokens.length === 1) variants.add(tokens[0])

  const words = normalised.split(' ').filter(Boolean)
  while (words.length > 0 && STOPWORDS.has(words[0])) words.shift()
  while (words.length > 0 && STOPWORDS.has(words[words.length - 1])) words.pop()
  const trimmed = words.join(' ')
  if (trimmed) variants.add(trimmed)

  return [...variants].filter((phrase) => {
    const words = phrase.split(' ').filter(Boolean)
    return words.length > 0 && words.some((word) => !STOPWORDS.has(word))
  })
}

export function phraseLike(phrase: string): string {
  return `%${phrase}%`
}

function escapeRegex(word: string): string {
  return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Postgres regex: exact consecutive words (word boundaries between each word). */
export function exactWordsRegex(phrases: string[]): string | null {
  if (phrases.length === 0) return null

  const patterns = phrases.map((phrase) => {
    const words = phrase.split(' ').filter(Boolean)
    return words.map((word) => `\\m${escapeRegex(word)}\\M`).join('\\s+')
  })

  return patterns.join('|')
}
