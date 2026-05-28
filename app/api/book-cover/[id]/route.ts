import { existsSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { sql } from '@/lib/db'
import {
  coverUrlCandidates,
  isUsableCoverBytes,
  MIN_OPEN_LIBRARY_COVER_BYTES,
  MIN_SCANNED_COVER_BYTES,
  resolveBestCoverUrl,
} from '@/lib/book-covers'

export const dynamic = 'force-dynamic'

/** 1.5in @ 96dpi — matches UI thumb size */
const THUMB_PX = 144
const CACHE_DIR = join(process.cwd(), '.cache', 'book-covers')
/** Thumbs generated from OL 1×1 placeholders are tiny; regenerate those. */
const MIN_CACHED_THUMB_BYTES = 1_500

function minBytesForUrl(url: string): number {
  if (url.includes('openlibrary.org')) return MIN_OPEN_LIBRARY_COVER_BYTES
  if (url.includes('gutenberg.org')) return MIN_SCANNED_COVER_BYTES
  return MIN_OPEN_LIBRARY_COVER_BYTES
}

async function fetchCoverBuffer(url: string): Promise<Buffer | null> {
  try {
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'ReadAI-Book-Club/1.0' },
      cache: 'force-cache',
    })
    if (!upstream.ok) return null
    const contentType = upstream.headers.get('content-type') ?? ''
    if (!contentType.toLowerCase().startsWith('image/')) return null
    const input = Buffer.from(await upstream.arrayBuffer())
    if (!isUsableCoverBytes(input.length, minBytesForUrl(url))) return null
    return input
  } catch {
    return null
  }
}

async function loadSourceBuffers(bookId: number): Promise<Buffer | null> {
  const rows = await sql`
    SELECT cover_url, gutenberg_id, title, author
    FROM books
    WHERE id = ${bookId}
    LIMIT 1
  `
  const row = rows[0] as {
    cover_url: string | null
    gutenberg_id: number | null
    title: string
    author: string | null
  } | undefined
  if (!row) return null

  const urls: string[] = []
  const stored = row.cover_url?.trim()
  if (stored && !urls.includes(stored)) urls.push(stored)
  if (row.gutenberg_id != null) {
    for (const url of coverUrlCandidates(row.gutenberg_id)) {
      if (!urls.includes(url)) urls.push(url)
    }
  }

  for (const url of urls) {
    const buf = await fetchCoverBuffer(url)
    if (buf) return buf
  }

  if (row.gutenberg_id != null) {
    const resolved = await resolveBestCoverUrl(row.gutenberg_id, {
      title: row.title,
      author: row.author,
    })
    if (resolved && !urls.includes(resolved)) {
      return fetchCoverBuffer(resolved)
    }
  }

  return null
}

export async function GET(
  _request: Request,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  const { id: idParam } = await Promise.resolve(context.params)
  const bookId = Number(idParam)
  if (!Number.isInteger(bookId) || bookId < 1) {
    return NextResponse.json({ error: 'Invalid book id' }, { status: 400 })
  }

  const cachePath = join(CACHE_DIR, `${bookId}.jpg`)
  if (existsSync(cachePath)) {
    const cached = await readFile(cachePath)
    if (cached.length < MIN_CACHED_THUMB_BYTES) {
      // stale placeholder thumb — fall through to regenerate
    } else {
    return new NextResponse(new Uint8Array(cached), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
    }
  }

  const input = await loadSourceBuffers(bookId)
  if (!input) {
    return NextResponse.json({ error: 'No cover' }, { status: 404 })
  }

  const thumb = await sharp(input)
    .rotate()
    .resize(THUMB_PX, THUMB_PX, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer()

  await mkdir(CACHE_DIR, { recursive: true })
  await writeFile(cachePath, thumb)

  return new NextResponse(new Uint8Array(thumb), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
