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

/** Single token as Postgres word boundary match. */
export function wordBoundaryRegex(token: string): string {
  return `\\m${escapeRegex(token)}\\M`
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

export interface FlexibleSearchQuery {
  whereSql: string
  params: unknown[]
  orderSql: string
}

type SearchField = 'title' | 'author' | 'both'

function fieldExpr(field: SearchField, column: 'title' | 'author'): string | null {
  if (field === 'both') return column === 'title' ? 'LOWER(title)' : 'LOWER(author)'
  if (field === column) return column === 'title' ? 'LOWER(title)' : 'LOWER(author)'
  return null
}

function buildMatchOrGroups(
  trimmed: string,
  field: SearchField,
  params: unknown[],
): string[] {
  const tokens = tokeniseSearch(trimmed)
  const exactRegex = exactWordsRegex(exactPhraseVariants(trimmed))
  const like = phraseLike(normalisePhrase(trimmed))
  const orGroups: string[] = []

  const titleCol = fieldExpr(field, 'title')
  const authorCol = fieldExpr(field, 'author')
  const cols = [titleCol, authorCol].filter(Boolean) as string[]

  if (exactRegex && cols.length > 0) {
    params.push(exactRegex)
    const n = params.length
    orGroups.push(`(${cols.map((c) => `${c} ~* $${n}`).join(' OR ')})`)
  } else if (tokens.length === 1) {
    params.push(wordBoundaryRegex(tokens[0]))
    const n = params.length
    orGroups.push(`(${cols.map((c) => `${c} ~* $${n}`).join(' OR ')})`)
  }

  params.push(like)
  const likeN = params.length
  orGroups.push(`(${cols.map((c) => `${c} LIKE $${likeN}`).join(' OR ')})`)

  return orGroups
}

/**
 * Exact phrase or substring match only — no fuzzy token scatter across unrelated titles.
 */
export function buildFlexibleSearchQuery(
  raw: string,
  field: SearchField = 'both',
): FlexibleSearchQuery | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  const params: unknown[] = []
  const orGroups = buildMatchOrGroups(trimmed, field, params)
  if (orGroups.length === 0) return null

  const exactRegex = exactWordsRegex(exactPhraseVariants(trimmed))
  const likeN = params.length
  const titleCol = fieldExpr(field, 'title')
  const exactParam = exactRegex ? '$1' : null

  const orderSql = `CASE
    WHEN ${exactParam && titleCol ? `${titleCol} ~* ${exactParam}` : 'FALSE'} THEN 0
    WHEN ${exactParam && field !== 'title' ? `LOWER(author) ~* ${exactParam}` : 'FALSE'} THEN 1
    WHEN ${titleCol ? `${titleCol} LIKE $${likeN}` : 'FALSE'} THEN 2
    ELSE 5
  END, id DESC`

  return {
    whereSql: `gutenberg_id IS NOT NULL AND (${orGroups.join(' OR ')})`,
    params,
    orderSql,
  }
}

/** Title + author search (e.g. "Pride and Prejudice by Austen"). */
export function buildTitleAuthorSearchQuery(
  titlePart: string,
  authorPart: string,
): FlexibleSearchQuery | null {
  const params: unknown[] = []
  const titleGroups = buildMatchOrGroups(titlePart.trim(), 'title', params)
  const authorGroups = buildMatchOrGroups(authorPart.trim(), 'author', params)
  if (titleGroups.length === 0 || authorGroups.length === 0) return null

  return {
    whereSql: `gutenberg_id IS NOT NULL AND (${titleGroups.join(' OR ')}) AND (${authorGroups.join(' OR ')})`,
    params,
    orderSql: 'id DESC',
  }
}
