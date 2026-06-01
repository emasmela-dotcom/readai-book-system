/** Homepage sections that load real club books (not external catalog tiles). */

export type HomeSectionId =
  | 'cookbooks'
  | 'magazines'
  | 'movies'
  | 'library'

export interface HomeSectionMeta {
  id: HomeSectionId
  title: string
  description: string
  viewAllHref: string
  viewAllLabel: string
  emptyMessage: string
}

export const HOME_SECTION_META: Record<HomeSectionId, HomeSectionMeta> = {
  cookbooks: {
    id: 'cookbooks',
    title: 'Cookbooks & kitchen reading',
    description: 'Full cookery and household texts on the club shelves.',
    viewAllHref: '/genres/cooking',
    viewAllLabel: 'Open cooking shelf',
    emptyMessage: 'Cookery titles are being added to the club library.',
  },
  magazines: {
    id: 'magazines',
    title: 'Magazine picks for variety',
    description: 'Periodicals and magazine-style reads you can open here.',
    viewAllHref: '/#library',
    viewAllLabel: 'Browse the club library',
    emptyMessage: 'Magazine-style titles are being added to the club library.',
  },
  movies: {
    id: 'movies',
    title: 'Movies & movie books',
    description: 'Film-related books on the club shelves.',
    viewAllHref: '/movies',
    viewAllLabel: 'Open film room',
    emptyMessage: 'Film books are being added to the club library.',
  },
  library: {
    id: 'library',
    title: 'Shelves across the club',
    description: 'Recently added full books across every room.',
    viewAllHref: '/#genres',
    viewAllLabel: 'Browse all rooms',
    emptyMessage: 'The club library is still loading.',
  },
}

export function isHomeSectionId(value: string): value is HomeSectionId {
  return value in HOME_SECTION_META
}
