import {
  buildReadHref,
  formatProgressLabel,
  type ReadingPosition,
} from '@/lib/reading-position'
import { getReadingPosition } from '@/lib/reading-position-store'

export const SAVED_BOOKS_CHANGED_EVENT = 'readai-saved-books-changed'

export type SavedBookEntry = {
  bookId: number
  position: ReadingPosition
  updatedAt: number
}

export type SavedBookListItem = SavedBookEntry & {
  book: {
    id: number
    title: string
    author: string
    coverUrl?: string
    gutenbergId?: number
  }
}

let entriesCache: SavedBookEntry[] | null = null
let loadPromise: Promise<SavedBookEntry[]> | null = null

function defaultPosition(): ReadingPosition {
  return { mode: 'pages', page: 1 }
}

function notifySavedBooksChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(SAVED_BOOKS_CHANGED_EVENT))
}

export function readSavedBookEntries(): SavedBookEntry[] {
  return entriesCache ?? []
}

export function readSavedBookIds(): number[] {
  return readSavedBookEntries().map((entry) => entry.bookId)
}

export function getSavedBookEntry(bookId: number): SavedBookEntry | null {
  return readSavedBookEntries().find((entry) => entry.bookId === bookId) ?? null
}

export function isBookSaved(bookId: number): boolean {
  return readSavedBookEntries().some((entry) => entry.bookId === bookId)
}

export async function refreshSavedBooks(): Promise<SavedBookEntry[]> {
  entriesCache = null
  loadPromise = null
  return ensureSavedBooksLoaded()
}

export async function fetchSavedBooksList(): Promise<SavedBookListItem[]> {
  if (typeof window === 'undefined') return []

  try {
    const res = await fetch('/api/saved-books', { cache: 'no-store' })
    if (res.status === 401) {
      entriesCache = []
      loadPromise = Promise.resolve([])
      return []
    }

    const data = await res.json()
    if (!data.success || !Array.isArray(data.entries)) {
      entriesCache = []
      return []
    }

    const items: SavedBookListItem[] = data.entries.map(
      (row: {
        bookId: number
        position: ReadingPosition
        updatedAt: number
        book: SavedBookListItem['book']
      }) => ({
        bookId: row.bookId,
        position: row.position,
        updatedAt: row.updatedAt,
        book: row.book,
      }),
    )

    entriesCache = items.map(({ bookId, position, updatedAt }) => ({
      bookId,
      position,
      updatedAt,
    }))
    loadPromise = Promise.resolve(entriesCache)
    return items
  } catch {
    entriesCache = []
    return []
  }
}

export async function ensureSavedBooksLoaded(): Promise<SavedBookEntry[]> {
  if (entriesCache) return entriesCache
  if (typeof window === 'undefined') return []

  if (!loadPromise) {
    loadPromise = fetch('/api/saved-books', { cache: 'no-store' })
      .then(async (res) => {
        if (res.status === 401) {
          entriesCache = []
          return []
        }
        const data = await res.json()
        if (!data.success || !Array.isArray(data.entries)) {
          entriesCache = []
          return []
        }
        const mapped: SavedBookEntry[] = data.entries.map(
          (row: { bookId: number; position: ReadingPosition; updatedAt: number }) => ({
            bookId: row.bookId,
            position: row.position,
            updatedAt: row.updatedAt,
          }),
        )
        entriesCache = mapped
        return mapped
      })
      .catch(() => {
        entriesCache = []
        return []
      })
  }

  return loadPromise
}

export function savedBookReadHref(bookId: number): string {
  const saved = getSavedBookEntry(bookId)
  const live = getReadingPosition(bookId)
  const position = saved?.position ?? live ?? defaultPosition()
  return buildReadHref(bookId, position)
}

export function savedBookProgressLabel(bookId: number, totalPages?: number): string {
  const saved = getSavedBookEntry(bookId)
  if (!saved) return ''
  return formatProgressLabel(saved.position, totalPages)
}

export async function updateSavedBookPosition(
  bookId: number,
  position: ReadingPosition,
): Promise<void> {
  if (!isBookSaved(bookId)) return

  try {
    const res = await fetch('/api/saved-books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, position, action: 'update' }),
    })
    if (!res.ok) return

    const entries = readSavedBookEntries()
    const index = entries.findIndex((entry) => entry.bookId === bookId)
    if (index >= 0) {
      entries[index] = { ...entries[index], position, updatedAt: Date.now() }
      entriesCache = [...entries]
    }
    notifySavedBooksChanged()
  } catch {
    // ignore network errors during reading
  }
}

export async function toggleSavedBookId(
  bookId: number,
  position?: ReadingPosition | null,
): Promise<boolean> {
  const resolved = position ?? getReadingPosition(bookId) ?? defaultPosition()

  const res = await fetch('/api/saved-books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookId, position: resolved, action: 'toggle' }),
  })

  const data = (await res.json()) as { success?: boolean; saved?: boolean; error?: string }
  if (!res.ok) {
    throw new Error(data.error ?? 'Could not save book.')
  }

  await refreshSavedBooks()
  notifySavedBooksChanged()
  return Boolean(data.saved)
}
