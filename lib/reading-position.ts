export type ReadingMode = 'pages' | 'scroll'

export type ReadingPosition = {
  mode: ReadingMode
  page?: number
  scrollY?: number
}

export function buildReadHref(bookId: number, position: ReadingPosition): string {
  const params = new URLSearchParams()

  if (position.mode === 'scroll') {
    params.set('mode', 'scroll')
    const y = position.scrollY
    if (typeof y === 'number' && y > 0) params.set('y', String(Math.round(y)))
  } else if (position.page && position.page > 1) {
    params.set('page', String(position.page))
  }

  const query = params.toString()
  return query ? `/books/${bookId}/read?${query}` : `/books/${bookId}/read`
}

export function formatProgressLabel(
  position: ReadingPosition,
  totalPages?: number,
): string {
  if (position.mode === 'scroll') {
    const y = position.scrollY ?? 0
    return y > 0 ? `Scroll · resumed ${formatScrollOffset(y)}` : 'Scroll · start'
  }
  const page = position.page ?? 1
  if (totalPages && totalPages > 0) return `Page ${page} of ${totalPages}`
  return page > 1 ? `Page ${page}` : 'Page 1'
}

function formatScrollOffset(scrollY: number): string {
  if (scrollY < 1200) return 'near the top'
  if (scrollY < 8000) return 'midway'
  return 'far in'
}

export function parseScrollYParam(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) return undefined
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return undefined
  return Math.round(n)
}

export function readingPositionFromView(
  mode: ReadingMode,
  page: number,
): ReadingPosition {
  if (mode === 'scroll') {
    return {
      mode: 'scroll',
      scrollY:
        typeof window !== 'undefined' ? Math.max(0, Math.round(window.scrollY)) : 0,
    }
  }
  return { mode: 'pages', page }
}
