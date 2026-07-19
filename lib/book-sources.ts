export type BookSourceId =
  | 'gutenberg'
  | 'standard-ebooks'
  | 'wikisource'
  | 'wikibooks'
  | 'wikipedia'
  | 'open-library'
  | 'internet-archive'
  | 'google-books'
  | 'hathitrust'
  | 'librivox'
  | 'manybooks'
  | 'feedbooks'
  | 'smashwords'
  | 'project-muse'
  | 'doab'
  | 'oapen'
  | 'jstor-open'
  | 'openstax'
  | 'libby'
  | 'hoopla'
  | 'worldcat'
  | 'library-of-congress'
  | 'dpla'
  | 'europeana'
  | 'british-library'
  | 'smithsonian-libraries'

export interface BookSourceLink {
  id: BookSourceId
  label: string
  tagline: string
  href: string
  access: 'read' | 'catalog' | 'search' | 'borrow'
}

export interface ConnectedSource {
  id: BookSourceId
  label: string
  tagline: string
  href: string
  access: BookSourceLink['access']
}

/** Canonical list for /sources and per-book legal source links. */
export const CONNECTED_SOURCES: ConnectedSource[] = [
  {
    id: 'gutenberg',
    label: 'Project Gutenberg',
    tagline: 'Public-domain ebooks that can be read directly in the club.',
    href: 'https://www.gutenberg.org/',
    access: 'read',
  },
  {
    id: 'standard-ebooks',
    label: 'Standard Ebooks',
    tagline: 'Polished public-domain editions and curated ebook formatting.',
    href: 'https://standardebooks.org/ebooks',
    access: 'catalog',
  },
  {
    id: 'wikisource',
    label: 'Wikisource',
    tagline: 'Open text transcriptions from the Wikimedia community.',
    href: 'https://en.wikisource.org/',
    access: 'search',
  },
  {
    id: 'wikibooks',
    label: 'Wikibooks',
    tagline: 'Free open textbooks and how-to collections from Wikimedia.',
    href: 'https://en.wikibooks.org/',
    access: 'read',
  },
  {
    id: 'wikipedia',
    label: 'Wikipedia',
    tagline: 'Author, work, and adaptation articles for context and discovery.',
    href: 'https://en.wikipedia.org/',
    access: 'search',
  },
  {
    id: 'open-library',
    label: 'Open Library',
    tagline: 'Preview and borrow options for a wider legal catalog.',
    href: 'https://openlibrary.org/',
    access: 'borrow',
  },
  {
    id: 'internet-archive',
    label: 'Internet Archive',
    tagline: 'Scans, lending, and archival book discovery.',
    href: 'https://archive.org/',
    access: 'borrow',
  },
  {
    id: 'google-books',
    label: 'Google Books',
    tagline: 'Preview pages and broad discovery for requested titles.',
    href: 'https://books.google.com/',
    access: 'search',
  },
  {
    id: 'hathitrust',
    label: 'HathiTrust',
    tagline: 'Library-held scans and public-domain depth.',
    href: 'https://www.hathitrust.org/',
    access: 'catalog',
  },
  {
    id: 'librivox',
    label: 'LibriVox',
    tagline: 'Public-domain audiobooks for readers who also want to listen.',
    href: 'https://librivox.org/',
    access: 'catalog',
  },
  {
    id: 'manybooks',
    label: 'ManyBooks',
    tagline: 'Expanded public-domain discovery and genre browsing.',
    href: 'https://manybooks.net/',
    access: 'catalog',
  },
  {
    id: 'smashwords',
    label: 'Smashwords',
    tagline: 'Discover indie and free-to-read ebook editions.',
    href: 'https://www.smashwords.com/',
    access: 'search',
  },
  {
    id: 'project-muse',
    label: 'Project MUSE Open Access',
    tagline: 'Open-access humanities and serious nonfiction reading.',
    href: 'https://muse.jhu.edu/',
    access: 'catalog',
  },
  {
    id: 'doab',
    label: 'Directory of Open Access Books',
    tagline: 'Open-access books across academic and general-interest subjects.',
    href: 'https://www.doabooks.org/',
    access: 'catalog',
  },
  {
    id: 'oapen',
    label: 'OAPEN Library',
    tagline: 'Open-access academic books and scholarly monographs.',
    href: 'https://library.oapen.org/',
    access: 'catalog',
  },
  {
    id: 'openstax',
    label: 'OpenStax',
    tagline: 'Free peer-reviewed textbooks for school and college subjects.',
    href: 'https://openstax.org/',
    access: 'read',
  },
  {
    id: 'jstor-open',
    label: 'JSTOR Open Content',
    tagline: 'Open-access scholarship and book discovery.',
    href: 'https://www.jstor.org/open/',
    access: 'search',
  },
  {
    id: 'libby',
    label: 'Libby / OverDrive',
    tagline: 'Library borrowing for readers with participating library cards.',
    href: 'https://www.overdrive.com/apps/libby',
    access: 'borrow',
  },
  {
    id: 'hoopla',
    label: 'Hoopla',
    tagline: 'Library ebooks, audiobooks, and media with a participating card.',
    href: 'https://www.hoopladigital.com/',
    access: 'borrow',
  },
  {
    id: 'worldcat',
    label: 'WorldCat',
    tagline: 'Library catalog discovery across institutions worldwide.',
    href: 'https://search.worldcat.org/',
    access: 'search',
  },
  {
    id: 'dpla',
    label: 'Digital Public Library of America',
    tagline: 'Millions of digitized items from libraries, archives, and museums.',
    href: 'https://dp.la/',
    access: 'search',
  },
  {
    id: 'europeana',
    label: 'Europeana',
    tagline: 'European cultural heritage texts, books, and digitized collections.',
    href: 'https://www.europeana.eu/',
    access: 'search',
  },
  {
    id: 'library-of-congress',
    label: 'Library of Congress Digital Collections',
    tagline: 'Historic texts, scans, and public collections from the Library of Congress.',
    href: 'https://www.loc.gov/collections/',
    access: 'catalog',
  },
  {
    id: 'british-library',
    label: 'British Library',
    tagline: 'Explore catalog and digitized collections from the UK national library.',
    href: 'https://www.bl.uk/',
    access: 'catalog',
  },
  {
    id: 'smithsonian-libraries',
    label: 'Smithsonian Libraries',
    tagline: 'Digitized books and research materials from Smithsonian collections.',
    href: 'https://library.si.edu/',
    access: 'catalog',
  },
]

export interface SourceBookInput {
  title: string
  author: string
  gutenbergId?: number | null
}

function buildQuery(title: string, author: string): string {
  return encodeURIComponent([title, author].filter(Boolean).join(' ').trim())
}

function catalogHref(id: BookSourceId): string | null {
  const source = CONNECTED_SOURCES.find((entry) => entry.id === id)
  return source?.href ?? null
}

/** Per-title deep link for legal source buttons on book pages. */
export function resolveBookSourceHref(id: BookSourceId, book: SourceBookInput): string {
  const q = buildQuery(book.title, book.author)

  switch (id) {
    case 'gutenberg':
      return book.gutenbergId
        ? `https://www.gutenberg.org/ebooks/${book.gutenbergId}`
        : `https://www.gutenberg.org/ebooks/search/?query=${q}`
    case 'standard-ebooks':
      return `https://standardebooks.org/ebooks?search=${q}`
    case 'feedbooks':
      return `https://www.feedbooks.com/search?query=${q}`
    case 'wikisource':
      return `https://en.wikisource.org/w/index.php?search=${q}&title=Special%3ASearch`
    case 'wikibooks':
      return `https://en.wikibooks.org/w/index.php?search=${q}&title=Special%3ASearch`
    case 'wikipedia':
      return `https://en.wikipedia.org/w/index.php?search=${q}&title=Special%3ASearch`
    case 'open-library':
      return `https://openlibrary.org/search?q=${q}`
    case 'internet-archive':
      return `https://archive.org/search?query=${q}`
    case 'google-books':
      return `https://books.google.com/books?q=${q}`
    case 'hathitrust':
      return `https://babel.hathitrust.org/cgi/ls?field1=ocr&q1=${q}`
    case 'librivox':
      return `https://librivox.org/search?search=${q}`
    case 'manybooks':
      return `https://manybooks.net/search-book?search=${q}`
    case 'smashwords':
      return `https://www.smashwords.com/books/search?query=${q}`
    case 'project-muse':
      return `https://muse.jhu.edu/search?q=${q}`
    case 'doab':
      return `https://www.doabooks.org/doab?func=search&query=${q}`
    case 'oapen':
      return `https://library.oapen.org/search?query=${q}`
    case 'openstax':
      return `https://openstax.org/search?q=${q}`
    case 'jstor-open':
      return `https://www.jstor.org/action/doBasicSearch?Query=${q}`
    case 'libby':
      return catalogHref('libby')!
    case 'hoopla':
      return catalogHref('hoopla')!
    case 'worldcat':
      return `https://search.worldcat.org/search?q=${q}`
    case 'dpla':
      return `https://dp.la/search?q=${q}`
    case 'europeana':
      return `https://www.europeana.eu/en/search?query=${q}`
    case 'library-of-congress':
      return `https://www.loc.gov/search/?q=${q}`
    case 'british-library':
      return `https://explore.bl.uk/primo_library/libweb/primo_search?query=any,contains,${q}`
    case 'smithsonian-libraries':
      return `https://library.si.edu/search/node/${q}`
    default:
      return catalogHref(id) ?? '#'
  }
}

export function buildBookSourceLinks(book: SourceBookInput): BookSourceLink[] {
  return CONNECTED_SOURCES.map((source) => ({
    id: source.id,
    label: source.label,
    tagline:
      source.id === 'gutenberg' && book.gutenbergId
        ? 'Read the public-domain edition directly.'
        : source.tagline,
    href: resolveBookSourceHref(source.id, book),
    access:
      source.id === 'gutenberg' && !book.gutenbergId ? 'search' : source.access,
  }))
}

const READABLE_SOURCE_IDS: BookSourceId[] = [
  'gutenberg',
  'standard-ebooks',
  'wikisource',
  'wikibooks',
  'librivox',
  'openstax',
]

/** Source links for titles with a confirmed readable edition only. */
export function buildReadableSourceLinks(book: SourceBookInput): BookSourceLink[] {
  return buildBookSourceLinks(book).filter((link) => READABLE_SOURCE_IDS.includes(link.id))
}

export function sourceAccessLabel(
  access: BookSourceLink['access'],
  locale: 'en' | 'es' = 'en',
): string {
  if (locale === 'es') {
    switch (access) {
      case 'read':
        return 'Leer'
      case 'catalog':
        return 'Explorar'
      case 'search':
        return 'Buscar'
      case 'borrow':
        return 'Prestar'
    }
  }

  switch (access) {
    case 'read':
      return 'Read'
    case 'catalog':
      return 'Browse'
    case 'search':
      return 'Search'
    case 'borrow':
      return 'Borrow'
  }
}
