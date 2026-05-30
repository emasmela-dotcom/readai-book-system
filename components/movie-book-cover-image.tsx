const DEFAULT_CLASS =
  'h-[4.5rem] w-[3rem] shrink-0 border border-white/15 bg-[#18120e] object-cover'

export function MovieBookCoverImage({
  coverUrl,
  title,
  className = DEFAULT_CLASS,
}: {
  coverUrl?: string | null
  title: string
  className?: string
}) {
  if (coverUrl?.trim()) {
    return (
      <img
        src={coverUrl.trim()}
        alt={`${title} movie book cover`}
        className={className}
        loading="lazy"
        decoding="async"
      />
    )
  }

  return (
    <div
      className={`${className} flex items-center justify-center p-1 text-center`}
      aria-label={`No movie book cover for ${title}`}
    >
      <span className="text-[8px] uppercase leading-tight tracking-wider text-[#eadfce]">
        Movie book
      </span>
    </div>
  )
}
