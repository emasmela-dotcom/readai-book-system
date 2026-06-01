export function ReadingModeTip({ className = '' }: { className?: string }) {
  return (
    <p
      className={`border border-[#c9a96e]/35 bg-[#171311] px-4 py-3 text-sm leading-relaxed text-[#f5f2ed] ${className}`}
      role="note"
    >
      <span className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">Tip · </span>
      Use the reading mode control above and choose <strong className="font-medium text-[#f5f2ed]">Scroll</strong>{' '}
      for a smoother flow through the full text.
    </p>
  )
}
