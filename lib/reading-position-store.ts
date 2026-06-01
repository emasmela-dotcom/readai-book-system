import type { ReadingPosition } from '@/lib/reading-position'

const POSITIONS_KEY = 'readai_reading_positions'

type PositionMap = Record<string, ReadingPosition>

function readMap(): PositionMap {
  if (typeof window === 'undefined') return {}
  try {
    const parsed = JSON.parse(localStorage.getItem(POSITIONS_KEY) ?? '{}')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed as PositionMap
  } catch {
    return {}
  }
}

function writeMap(map: PositionMap): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(POSITIONS_KEY, JSON.stringify(map))
}

export function recordReadingPosition(bookId: number, position: ReadingPosition): void {
  const map = readMap()
  map[String(bookId)] = position
  writeMap(map)
}

export function getReadingPosition(bookId: number): ReadingPosition | null {
  const entry = readMap()[String(bookId)]
  if (!entry || (entry.mode !== 'pages' && entry.mode !== 'scroll')) return null
  return entry
}
