'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export type ReaderMode = 'pages' | 'scroll'

interface ReaderModeSelectProps {
  mode: ReaderMode
}

export function ReaderModeSelect({ mode }: ReaderModeSelectProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleChange(nextMode: ReaderMode) {
    const params = new URLSearchParams(searchParams.toString())

    if (nextMode === 'scroll') {
      params.set('mode', 'scroll')
      params.delete('page')
    } else {
      params.delete('mode')
    }

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <label className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.2em] text-[#e8e4df]/75">Reading mode</span>
      <div className="relative">
        <select
          value={mode}
          onChange={(event) => handleChange(event.target.value as ReaderMode)}
          className="appearance-none border border-[#d9c8b0] bg-[#f5f2ed] px-4 py-2 pr-8 text-xs font-medium uppercase tracking-wider text-[#0e0c0a] outline-none transition hover:border-[#c9a96e] focus:border-[#c9a96e]"
        >
          <option value="pages">Pages</option>
          <option value="scroll">Scroll</option>
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#0e0c0a]">
          ▼
        </span>
      </div>
    </label>
  )
}
