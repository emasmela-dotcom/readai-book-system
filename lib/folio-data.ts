export const CURRENT_BOOK = {
  title: 'Klara and the Sun',
  author: 'Kazuo Ishiguro',
  year: 2021,
  pages: 303,
  genre: 'Literary Fiction',
  genres: ['Literary Fiction', 'Science Fiction', 'Dystopian'],
  progress: 62,
  currentPage: 188,
  coverHue: '#3d3428',
}

export const FEATURED_INSIGHT =
  'Ishiguro asks whether devotion can exist without understanding — Klara\'s love is luminous precisely because it may be built on a beautiful error.'

export const AI_PROMPTS = [
  { id: 'themes', label: 'Themes' },
  { id: 'discussion', label: 'Discussion questions' },
  { id: 'similar', label: 'Similar books' },
  { id: 'author', label: 'Author context' },
] as const

export type PromptId = (typeof AI_PROMPTS)[number]['id']

export const AI_STUB_RESPONSES: Record<PromptId, string> = {
  themes:
    'Memory, sacrifice, and the ethics of artificial consciousness thread through every scene. The sun becomes both deity and metaphor — what we worship when we cannot name what we need.',
  discussion:
    'Does Klara\'s love qualify as moral action if her model of the world is incomplete? When does optimism become complicity? Who in the novel truly sees the child?',
  similar:
    'Consider Never Let Me Go, The Children Act, and Machines Like Me — each tests how tenderness survives inside systems designed to limit it.',
  author:
    'Ishiguro writes restraint as revelation. His Nobel citation honors writers who uncover the abyss beneath our civilities — Klara extends that inquiry into the near future.',
}

export const UPCOMING_BOOKS = [
  { title: 'The Remains of the Day', author: 'Kazuo Ishiguro', month: 'June' },
  { title: 'Beloved', author: 'Toni Morrison', month: 'July' },
  { title: 'Atonement', author: 'Ian McEwan', month: 'August' },
]

export const DISCUSSION_THREAD = [
  {
    member: 'Elena M.',
    time: '2h ago',
    text: 'The moment Klara rearranges the glass — I keep returning to what she believes she is healing.',
  },
  {
    member: 'James R.',
    time: '5h ago',
    text: 'Is the Mother\'s choice cruelty or the only language this world allows?',
  },
  {
    member: 'Sofia K.',
    time: 'Yesterday',
    text: 'Chapter 3 changed how I read every subsequent interaction with the sun.',
  },
]

export const MEMBERS = [
  { name: 'Elena M.', initials: 'EM', progress: 78 },
  { name: 'James R.', initials: 'JR', progress: 62 },
  { name: 'Sofia K.', initials: 'SK', progress: 45 },
  { name: 'Marcus T.', initials: 'MT', progress: 91 },
  { name: 'You', initials: 'YO', progress: 62, isYou: true },
]
