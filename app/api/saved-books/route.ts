import { NextRequest, NextResponse } from 'next/server'
import type { ReadingPosition } from '@/lib/reading-position'
import { getSessionUser } from '@/lib/auth/session'
import {
  isBookSavedForUser,
  listSavedBooksForUser,
  saveBookForUser,
  unsaveBookForUser,
} from '@/lib/saved-books-server'

export const dynamic = 'force-dynamic'

function parseReadingPosition(value: unknown): ReadingPosition | null {
  if (!value || typeof value !== 'object') return null
  const pos = value as ReadingPosition
  if (pos.mode === 'scroll') {
    return {
      mode: 'scroll',
      scrollY: typeof pos.scrollY === 'number' ? Math.max(0, Math.round(pos.scrollY)) : 0,
    }
  }
  if (pos.mode === 'pages') {
    const page = typeof pos.page === 'number' ? Math.max(1, Math.round(pos.page)) : 1
    return { mode: 'pages', page }
  }
  return null
}

function defaultPosition(): ReadingPosition {
  return { mode: 'pages', page: 1 }
}

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sign in required.' }, { status: 401 })
  }

  try {
    const entries = await listSavedBooksForUser(user.id)
    return NextResponse.json(
      {
        success: true,
        entries: entries.map((entry) => ({
          bookId: entry.bookId,
          position: entry.position,
          updatedAt: entry.updatedAt,
          book: {
            id: entry.bookId,
            title: entry.title,
            author: entry.author,
            coverUrl: entry.coverUrl,
            gutenbergId: entry.gutenbergId,
          },
        })),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message, entries: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sign in required.' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as {
      bookId?: number
      position?: unknown
      action?: 'toggle' | 'save' | 'unsave' | 'update'
    }

    const bookId = body.bookId
    if (typeof bookId !== 'number' || !Number.isInteger(bookId) || bookId < 1) {
      return NextResponse.json({ success: false, error: 'Invalid book.' }, { status: 400 })
    }

    const action = body.action ?? 'toggle'
    const position = parseReadingPosition(body.position) ?? defaultPosition()

    if (action === 'unsave') {
      await unsaveBookForUser(user.id, bookId)
      return NextResponse.json({ success: true, saved: false })
    }

    if (action === 'update' || action === 'save') {
      await saveBookForUser(user.id, bookId, position)
      return NextResponse.json({ success: true, saved: true })
    }

    const alreadySaved = await isBookSavedForUser(user.id, bookId)
    if (alreadySaved) {
      await unsaveBookForUser(user.id, bookId)
      return NextResponse.json({ success: true, saved: false })
    }

    await saveBookForUser(user.id, bookId, position)
    return NextResponse.json({ success: true, saved: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
