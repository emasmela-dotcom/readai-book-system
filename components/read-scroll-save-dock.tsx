'use client'

import type { ReaderMode } from '@/components/reader-mode-select'
import { SaveBookButton } from '@/components/save-book-button'

/** Fixed save control — stays on screen while reading in scroll mode. */
export function ReadScrollSaveDock({
  bookId,
  mode,
  page,
}: {
  bookId: number
  mode: ReaderMode
  page: number
}) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/20 bg-[#0e0c0a]/98 px-5 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.45)] backdrop-blur-md md:bottom-6 md:left-auto md:right-6 md:w-auto md:border md:shadow-lg"
      role="toolbar"
      aria-label="Save your reading place"
    >
      <div className="mx-auto flex max-w-3xl items-center justify-end md:mx-0">
        <SaveBookButton bookId={bookId} size="compact" mode={mode} page={page} />
      </div>
    </div>
  )
}
