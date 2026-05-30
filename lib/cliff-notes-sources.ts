export interface CliffNotesSource {
  id: string
  label: string
  tagline: string
  href: string
  access: 'read' | 'browse' | 'search'
}

export const CLIFF_NOTES_SOURCES: CliffNotesSource[] = [
  {
    id: 'sparknotes',
    label: 'SparkNotes',
    tagline: 'Summaries, themes, and study questions for school reads.',
    href: 'https://www.sparknotes.com/',
    access: 'read',
  },
  {
    id: 'cliffsnotes',
    label: 'CliffsNotes',
    tagline: 'Plot summaries, analysis, and test prep for classic titles.',
    href: 'https://www.cliffsnotes.com/',
    access: 'read',
  },
  {
    id: 'litcharts',
    label: 'LitCharts',
    tagline: 'Charts, quotes, and theme breakdowns for literature.',
    href: 'https://www.litcharts.com/',
    access: 'browse',
  },
  {
    id: 'gradesaver',
    label: 'GradeSaver',
    tagline: 'Study guides, essays, and Q&A for assigned books.',
    href: 'https://www.gradesaver.com/',
    access: 'browse',
  },
  {
    id: 'shmoop',
    label: 'Shmoop',
    tagline: 'Plain-language summaries and analysis for students.',
    href: 'https://www.shmoop.com/literature/',
    access: 'read',
  },
  {
    id: 'wikipedia',
    label: 'Wikipedia',
    tagline: 'Plot overviews and background on notable works.',
    href: 'https://en.wikipedia.org/wiki/Category:Literary_criticism',
    access: 'search',
  },
]

export function cliffNotesAccessLabel(access: CliffNotesSource['access']): string {
  switch (access) {
    case 'read':
      return 'Read'
    case 'browse':
      return 'Browse'
    case 'search':
      return 'Search'
  }
}
