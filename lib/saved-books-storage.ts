import {
  buildReadHref,
  formatProgressLabel,
  type ReadingPosition,
} from '@/lib/reading-position'
import { getReadingPosition } from '@/lib/reading-position-store'

export const SAVED_BOOKS_STORAGE_KEY = 'readai_saved_books'

export type SavedBookEntry = {
  bookId: number
  position: ReadingPosition
  updatedAt: number
}

function defaultPosition(): ReadingPosition {
  return { mode: 'pages', page: 1 }
}

function isReadingPosition(value: unknown): value is ReadingPosition {
  if (!value || typeof value !== 'object') return false
  const pos = value as ReadingPosition
  return pos.mode === 'pages' || pos.mode === 'scroll'
}

function parseEntries(raw: unknown): SavedBookEntry[] {
  if (!Array.isArray(raw)) return []

  if (raw.length > 0 && typeof raw[0] === 'number') {
    return (raw as number[])
      .filter((id) => Number.isInteger(id) && id > 0)
      .map((bookId) => ({
        bookId,
        position: defaultPosition(),
        updatedAt: Date.now(),
      }))
  }

  const entries: SavedBookEntry[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const row = item as Partial<SavedBookEntry> & { id?: number }
    const bookId = row.bookId ?? row.id
    if (typeof bookId !== 'number' || !Number.isInteger(bookId) || bookId < 1) continue
    entries.push({
      bookId,
      position: isReadingPosition(row.position) ? row.position : defaultPosition(),
      updatedAt: typeof row.updatedAt === 'number' ? row.updatedAt : Date.now(),
    })
  }
  return entries
}

export function readSavedBookEntries(): SavedBookEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return parseEntries(JSON.parse(localStorage.getItem(SAVED_BOOKS_STORAGE_KEY) ?? '[]'))
  } catch {
    return []
  }
}

export function writeSavedBookEntries(entries: SavedBookEntry[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SAVED_BOOKS_STORAGE_KEY, JSON.stringify(entries))
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

export function updateSavedBookPosition(bookId: number, position: ReadingPosition): void {
  const entries = readSavedBookEntries()
  const index = entries.findIndex((entry) => entry.bookId === bookId)
  if (index < 0) return
  entries[index] = { ...entries[index], position, updatedAt: Date.now() }
  writeSavedBookEntries(entries)
}

export function toggleSavedBookId(
  bookId: number,
  position?: ReadingPosition | null,
): boolean {
  const entries = readSavedBookEntries()
  const index = entries.findIndex((entry) => entry.bookId === bookId)

  if (index >= 0) {
    entries.splice(index, 1)
    writeSavedBookEntries(entries)
    return false
  }

  const resolved =
    position ?? getReadingPosition(bookId) ?? defaultPosition()

  entries.push({
    bookId,
    position: resolved,
    updatedAt: Date.now(),
  })
  writeSavedBookEntries(entries)
  return true
}
