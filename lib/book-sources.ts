export interface BookSourceLink {
  id:
    | 'gutenberg'
    | 'standard-ebooks'
    | 'wikisource'
    | 'open-library'
    | 'internet-archive'
    | 'google-books'
    | 'hathitrust'
    | 'librivox'
    | 'manybooks'
    | 'project-muse'
    | 'doab'
    | 'jstor-open'
    | 'libby'
    | 'worldcat'
    | 'library-of-congress'
  label: string
  tagline: string
  href: string
  access: 'read' | 'catalog' | 'search' | 'borrow'
}

export interface ConnectedSource {
  id: BookSourceLink['id']
  label: string
  tagline: string
  href: string
  access: BookSourceLink['access']
}

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
    id: 'worldcat',
    label: 'WorldCat',
    tagline: 'Library catalog discovery across institutions worldwide.',
    href: 'https://search.worldcat.org/',
    access: 'search',
  },
  {
    id: 'library-of-congress',
    label: 'Library of Congress Digital Collections',
    tagline: 'Historic texts, scans, and public collections from the Library of Congress.',
    href: 'https://www.loc.gov/collections/',
    access: 'catalog',
  },
]

interface SourceBookInput {
  title: string
  author: string
  gutenbergId?: number | null
}

function buildQuery(title: string, author: string): string {
  return encodeURIComponent([title, author].filter(Boolean).join(' ').trim())
}

export function buildBookSourceLinks(book: SourceBookInput): BookSourceLink[] {
  const query = buildQuery(book.title, book.author)

  return [
    ...(book.gutenbergId
      ? [
          {
            id: 'gutenberg' as const,
            label: 'Project Gutenberg',
            tagline: 'Read the public-domain edition directly.',
            href: `https://www.gutenberg.org/ebooks/${book.gutenbergId}`,
            access: 'read' as const,
          },
        ]
      : []),
    {
      id: 'standard-ebooks',
      label: 'Standard Ebooks',
      tagline: 'Browse polished public-domain editions.',
      href: 'https://standardebooks.org/ebooks',
      access: 'catalog',
    },
    {
      id: 'wikisource',
      label: 'Wikisource',
      tagline: 'Search open text transcriptions.',
      href: `https://en.wikisource.org/w/index.php?search=${query}&title=Special%3ASearch`,
      access: 'search',
    },
    {
      id: 'open-library',
      label: 'Open Library',
      tagline: 'Search previews and borrowable copies.',
      href: `https://openlibrary.org/search?q=${query}`,
      access: 'borrow',
    },
    {
      id: 'internet-archive',
      label: 'Internet Archive',
      tagline: 'Search scans and borrowable editions.',
      href: `https://archive.org/search?query=${query}`,
      access: 'borrow',
    },
  ]
}

export function sourceAccessLabel(access: BookSourceLink['access']): string {
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
