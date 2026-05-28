export interface MagazineSource {
  id: string
  label: string
  tagline: string
  href: string
  access: 'read' | 'subscribe' | 'news'
}

export const MAGAZINE_SOURCES: MagazineSource[] = [
  {
    id: 'new-yorker',
    label: 'The New Yorker',
    tagline: 'Long-form essays, culture, fiction, and criticism.',
    href: 'https://www.newyorker.com/',
    access: 'subscribe',
  },
  {
    id: 'atlantic',
    label: 'The Atlantic',
    tagline: 'Ideas, society, politics, and deep narrative journalism.',
    href: 'https://www.theatlantic.com/',
    access: 'subscribe',
  },
  {
    id: 'paris-review',
    label: 'The Paris Review',
    tagline: 'Literary interviews, essays, and fiction.',
    href: 'https://www.theparisreview.org/',
    access: 'subscribe',
  },
  {
    id: 'london-review-of-books',
    label: 'London Review of Books',
    tagline: 'In-depth reviews and literary commentary.',
    href: 'https://www.lrb.co.uk/',
    access: 'subscribe',
  },
  {
    id: 'new-york-review-of-books',
    label: 'The New York Review of Books',
    tagline: 'Serious book reviews and public-intellectual essays.',
    href: 'https://www.nybooks.com/',
    access: 'subscribe',
  },
  {
    id: 'granta',
    label: 'Granta',
    tagline: 'Contemporary literary writing and themed issues.',
    href: 'https://granta.com/',
    access: 'subscribe',
  },
  {
    id: 'harpers',
    label: "Harper's Magazine",
    tagline: 'Essays, reportage, and literary nonfiction.',
    href: 'https://harpers.org/',
    access: 'subscribe',
  },
  {
    id: 'poetry-magazine',
    label: 'Poetry Magazine',
    tagline: 'Poetry, criticism, and new voices.',
    href: 'https://www.poetryfoundation.org/poetrymagazine',
    access: 'read',
  },
]

export function magazineAccessLabel(access: MagazineSource['access']): string {
  switch (access) {
    case 'read':
      return 'Read'
    case 'subscribe':
      return 'Subscribe'
    case 'news':
      return 'News'
  }
}
