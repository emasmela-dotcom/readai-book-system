export interface CookbookSource {
  id: string
  label: string
  tagline: string
  href: string
  access: 'read' | 'browse' | 'search'
}

export const COOKBOOK_SOURCES: CookbookSource[] = [
  {
    id: 'internet-archive',
    label: 'Internet Archive',
    tagline: 'Borrow and read scanned cookbooks and kitchen classics.',
    href: 'https://archive.org/search?query=cookbook',
    access: 'read',
  },
  {
    id: 'open-library',
    label: 'Open Library',
    tagline: 'Search cookbooks, food writing, and culinary history.',
    href: 'https://openlibrary.org/search?q=cookbook',
    access: 'search',
  },
  {
    id: 'gutenberg',
    label: 'Project Gutenberg',
    tagline: 'Public-domain cookery and household texts.',
    href: 'https://www.gutenberg.org/ebooks/search/?query=cookery',
    access: 'read',
  },
  {
    id: 'wikibooks',
    label: 'Wikibooks Cookbook',
    tagline: 'Community recipes and techniques, free to read.',
    href: 'https://en.wikibooks.org/wiki/Cookbook',
    access: 'read',
  },
  {
    id: 'google-books',
    label: 'Google Books',
    tagline: 'Discover cookbooks and food memoirs to borrow or buy.',
    href: 'https://books.google.com/',
    access: 'browse',
  },
  {
    id: 'worldcat',
    label: 'WorldCat',
    tagline: 'Find cookbook editions at libraries near you.',
    href: 'https://search.worldcat.org/search?q=cookbook',
    access: 'search',
  },
]

export function cookbookAccessLabel(access: CookbookSource['access']): string {
  switch (access) {
    case 'read':
      return 'Read'
    case 'browse':
      return 'Browse'
    case 'search':
      return 'Search'
  }
}
