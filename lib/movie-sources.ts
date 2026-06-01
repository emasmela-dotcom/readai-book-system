export type MovieSourceAccess = 'books' | 'search' | 'catalog'

export interface MovieSourceLink {
  id:
    | 'open-library'
    | 'internet-archive'
    | 'google-books'
    | 'worldcat'
    | 'wikipedia'
  label: string
  tagline: string
  href: string
  access: MovieSourceAccess
}

/** Sites for movie-related books (screenplays, novelizations, criticism). */
export const CONNECTED_MOVIE_SOURCES: MovieSourceLink[] = [
  {
    id: 'open-library',
    label: 'Open Library',
    tagline: 'Novelizations, tie-ins, and related editions.',
    href: 'https://openlibrary.org/',
    access: 'books',
  },
  {
    id: 'google-books',
    label: 'Google Books',
    tagline: 'Discover movie books and screenplays.',
    href: 'https://books.google.com/',
    access: 'books',
  },
  {
    id: 'internet-archive',
    label: 'Internet Archive',
    tagline: 'Scans and borrowable film-related texts.',
    href: 'https://archive.org/',
    access: 'books',
  },
  {
    id: 'worldcat',
    label: 'WorldCat',
    tagline: 'Library holdings for film books worldwide.',
    href: 'https://search.worldcat.org/',
    access: 'catalog',
  },
  {
    id: 'wikipedia',
    label: 'Wikipedia',
    tagline: 'Film articles and adaptation notes.',
    href: 'https://en.wikipedia.org/',
    access: 'search',
  },
]

export interface FeaturedFilm {
  key: string
  title: string
  year?: number
  /** When the club catalog title differs from the film title */
  clubBookTitle?: string
  /** Card label when it differs from the film title */
  bookDisplayTitle?: string
  /** Open Library / Archive search when the film title alone is ambiguous */
  bookSearchQuery?: string
  /** Verified Internet Archive item with read or borrow (not a catalog-only page) */
  readArchiveId?: string
  /** No film tie-in book — link to source search instead of guessing a wrong title */
  searchOnly?: boolean
}

/** Well-known films — search messaging and the Movies section gallery. */
export const FEATURED_FILMS: FeaturedFilm[] = [
  {
    key: 'pulp fiction',
    title: 'Pulp Fiction',
    year: 1994,
    bookDisplayTitle: 'Pulp Fiction (Screenplay)',
    bookSearchQuery: 'Pulp Fiction Quentin Tarantino screenplay',
    readArchiveId: 'pulpfictionquent00tara',
  },
  {
    key: 'the godfather',
    title: 'The Godfather',
    year: 1972,
    bookSearchQuery: 'The Godfather Mario Puzo',
    readArchiveId: 'godfatherbook10000mari',
  },
  {
    key: 'frozen',
    title: 'Frozen',
    year: 2013,
    bookSearchQuery: 'Frozen Bill Scollon',
    readArchiveId: 'frozen0000scol',
  },
  {
    key: 'frozen river',
    title: 'Frozen River',
    year: 2008,
    bookDisplayTitle: 'Frozen River (film — no tie-in novel)',
    bookSearchQuery: 'Frozen River 2008 film book',
    searchOnly: true,
  },
  {
    key: 'the matrix',
    title: 'The Matrix',
    year: 1999,
    bookSearchQuery: 'The Matrix Wachowski novel',
    readArchiveId: 'matrix0000wach',
  },
  {
    key: 'inception',
    title: 'Inception',
    year: 2010,
    bookDisplayTitle: 'Inception (Shooting Script)',
    bookSearchQuery: 'Inception Christopher Nolan shooting script',
    readArchiveId: 'inceptionshootin0000nola',
  },
  {
    key: 'jaws',
    title: 'Jaws',
    year: 1975,
    bookSearchQuery: 'Jaws Peter Benchley',
    readArchiveId: 'jaws0000benc',
  },
  {
    key: 'titanic',
    title: 'Titanic',
    year: 1997,
    bookDisplayTitle: 'Titanic (Illustrated Screenplay)',
    bookSearchQuery: 'Titanic James Cameron screenplay',
    readArchiveId: 'titanicjamescame0000came',
  },
]

function encodeQuery(q: string): string {
  return encodeURIComponent(q.trim())
}

export function normaliseFilmQuery(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function matchKnownFilm(query: string): { title: string; year?: number } | null {
  const key = normaliseFilmQuery(query)
  if (!key) return null
  const sorted = [...FEATURED_FILMS].sort((a, b) => b.key.length - a.key.length)
  const hit = sorted.find((f) => f.key === key || key.includes(f.key))
  return hit ? { title: hit.title, year: hit.year } : null
}

export function isLikelyFilmSearch(query: string): boolean {
  return matchKnownFilm(query) != null
}

/** Per-search links using the title the user typed (or matched film title). */
export function buildMovieSourceLinks(query: string): MovieSourceLink[] {
  const known = matchKnownFilm(query)
  const searchTerm = known?.title ?? query.trim()
  if (!searchTerm) return []

  const q = encodeQuery(searchTerm)

  return [
    {
      id: 'open-library',
      label: 'Open Library',
      tagline: 'Search novelizations, tie-ins, and related books.',
      href: `https://openlibrary.org/search?q=${q}`,
      access: 'books',
    },
    {
      id: 'google-books',
      label: 'Google Books',
      tagline: 'Search movie books, scripts, and behind-the-scenes editions.',
      href: `https://books.google.com/books?q=${q}`,
      access: 'books',
    },
    {
      id: 'internet-archive',
      label: 'Internet Archive',
      tagline: 'Search scans and borrowable film-related material.',
      href: `https://archive.org/search?query=${q}`,
      access: 'books',
    },
    {
      id: 'worldcat',
      label: 'WorldCat',
      tagline: 'Find film books in libraries near you.',
      href: `https://search.worldcat.org/search?q=${q}`,
      access: 'catalog',
    },
    {
      id: 'wikipedia',
      label: 'Wikipedia',
      tagline: 'Read the film article and adaptation background.',
      href: `https://en.wikipedia.org/w/index.php?search=${q}&title=Special%3ASearch`,
      access: 'search',
    },
  ]
}

export function movieAccessLabel(access: MovieSourceAccess): string {
  switch (access) {
    case 'books':
      return 'Movie books'
    case 'search':
      return 'Search'
    case 'catalog':
      return 'Libraries'
  }
}
