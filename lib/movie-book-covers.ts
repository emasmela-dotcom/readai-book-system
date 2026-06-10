import { searchOpenLibraryCover } from '@/lib/book-covers'
import { buildBookSourceLinks, resolveBookSourceHref, type BookSourceLink } from '@/lib/book-sources'
import { matchKnownFilm } from '@/lib/movie-sources'
import type { FeaturedFilm } from '@/lib/movie-sources'

export interface FeaturedFilmDisplay {
  bookTitle: string
  coverUrl: string | null
  sources: BookSourceLink[]
  /** Primary Open Library search for the movie book. */
  searchHref: string
}

export type ResolveFeaturedFilmInput = Pick<
  FeaturedFilm,
  'title' | 'clubBookTitle' | 'bookSearchQuery' | 'bookDisplayTitle' | 'readArchiveId' | 'searchOnly'
>

function bookTitleForFilm(input: ResolveFeaturedFilmInput): string {
  const filmTitle = input.title.trim()
  const known = filmTitle ? matchKnownFilm(filmTitle) : null
  return (
    input.bookDisplayTitle?.trim() ||
    input.clubBookTitle?.trim() ||
    input.bookSearchQuery?.trim() ||
    known?.title ||
    filmTitle
  )
}

function displayForBookTitle(bookTitle: string): FeaturedFilmDisplay {
  if (!bookTitle) {
    return { bookTitle: '', coverUrl: null, sources: [], searchHref: '' }
  }

  const book = { title: bookTitle, author: '', gutenbergId: null as number | null }
  return {
    bookTitle,
    coverUrl: null,
    sources: buildBookSourceLinks(book),
    searchHref: resolveBookSourceHref('open-library', book),
  }
}

/** Fast listing — source links only, no cover fetch (for large film grids). */
export function resolveFeaturedFilmListing(
  film: ResolveFeaturedFilmInput | string,
  legacyClubBookTitle?: string,
): FeaturedFilmDisplay {
  const input: ResolveFeaturedFilmInput =
    typeof film === 'string'
      ? { title: film, clubBookTitle: legacyClubBookTitle }
      : film
  return displayForBookTitle(bookTitleForFilm(input))
}

/** Connected sources only — no club catalog links. */
export async function resolveFeaturedFilm(
  film: ResolveFeaturedFilmInput | string,
  legacyClubBookTitle?: string,
): Promise<FeaturedFilmDisplay> {
  const input: ResolveFeaturedFilmInput =
    typeof film === 'string'
      ? { title: film, clubBookTitle: legacyClubBookTitle }
      : film

  const bookTitle = bookTitleForFilm(input)
  const display = displayForBookTitle(bookTitle)
  if (!bookTitle) return display

  const coverUrl = await searchOpenLibraryCover(bookTitle, null)
  return { ...display, coverUrl }
}

export async function resolveMovieBook(film: ResolveFeaturedFilmInput | string): Promise<FeaturedFilmDisplay> {
  return resolveFeaturedFilm(film)
}

export async function searchMovieBookCover(film: ResolveFeaturedFilmInput | string): Promise<string | null> {
  const display = await resolveFeaturedFilm(film)
  return display.coverUrl
}
