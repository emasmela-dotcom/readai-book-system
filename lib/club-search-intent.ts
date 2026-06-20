import { normalisePhrase } from '@/lib/book-search'

export type ClubSearchIntent =
  | 'book_lookup'
  | 'discussion'
  | 'themes'
  | 'summary'
  | 'characters'
  | 'character'
  | 'ending'
  | 'author'
  | 'author_bio'
  | 'similar'
  | 'comparison'
  | 'quotes'
  | 'context'
  | 'message'
  | 'symbols'
  | 'controversy'
  | 'opinion'
  | 'icebreaker'
  | 'club_picks'
  | 'theme_topic'

export type ParsedClubSearch = {
  raw: string
  intent: ClubSearchIntent
  /** Book title or primary subject extracted from the query. */
  subject: string
  /** Secondary subject (e.g. other book in a comparison). */
  secondarySubject: string | null
  /** When intent is theme_topic, the theme word (grief, friendship, etc.). */
  themeTopic: string | null
}

const CHARACTER_BOOK_HINTS: Record<string, string> = {
  'elizabeth bennet': 'Pride and Prejudice',
  'mr darcy': 'Pride and Prejudice',
  'fitzwilliam darcy': 'Pride and Prejudice',
  'jane bennet': 'Pride and Prejudice',
  'jay gatsby': 'The Great Gatsby',
  'gatsby': 'The Great Gatsby',
  'holden caulfield': 'The Catcher in the Rye',
  'sherlock holmes': 'The Adventures of Sherlock Holmes',
  'dr watson': 'The Adventures of Sherlock Holmes',
  'victor frankenstein': 'Frankenstein',
  'the creature': 'Frankenstein',
  'frankenstein': 'Frankenstein',
  'captain ahab': 'Moby Dick',
  'ishmael': 'Moby Dick',
  'heathcliff': 'Wuthering Heights',
  'catherine earnshaw': 'Wuthering Heights',
  'jane eyre': 'Jane Eyre',
  'mr rochester': 'Jane Eyre',
  'jo march': 'Little Women',
  'scrooge': 'A Christmas Carol',
  'ebenezer scrooge': 'A Christmas Carol',
  'odysseus': 'The Odyssey',
  'ulysses': 'The Odyssey',
  'achilles': 'The Iliad',
  'hamlet': 'Hamlet',
  'lady macbeth': 'Macbeth',
  'macbeth': 'Macbeth',
  'count dracula': 'Dracula',
  'mina harker': 'Dracula',
  'alice': 'Alice in Wonderland',
  'dorothy': 'The Wonderful Wizard of Oz',
  'pip': 'Great Expectations',
  'jean valjean': 'Les Misérables',
  'javert': 'Les Misérables',
}

const INTENT_PATTERNS: { intent: ClubSearchIntent; pattern: RegExp; subjectGroup?: number }[] = [
  { intent: 'club_picks', pattern: /^best book club books?$/i },
  { intent: 'discussion', pattern: /^(.+?) discussion questions$/i, subjectGroup: 1 },
  { intent: 'themes', pattern: /^(.+?) themes?$/i, subjectGroup: 1 },
  { intent: 'summary', pattern: /^(.+?) summary$/i, subjectGroup: 1 },
  { intent: 'summary', pattern: /what is (.+?) about$/i, subjectGroup: 1 },
  { intent: 'ending', pattern: /^(.+?) ending$/i, subjectGroup: 1 },
  { intent: 'symbols', pattern: /^symbols in (.+)/i, subjectGroup: 1 },
  { intent: 'quotes', pattern: /^(.+?) quotes$/i, subjectGroup: 1 },
  { intent: 'author', pattern: /^who wrote (.+)/i, subjectGroup: 1 },
  { intent: 'author_bio', pattern: /what inspired (.+?) to write (.+)/i, subjectGroup: 2 },
  { intent: 'discussion', pattern: /discussion questions (?:for|about) (.+)/i, subjectGroup: 1 },
  { intent: 'discussion', pattern: /what questions should a book club ask about (.+)/i, subjectGroup: 1 },
  { intent: 'discussion', pattern: /questions (?:for|about) (.+)/i, subjectGroup: 1 },
  { intent: 'themes', pattern: /themes? in (.+)/i, subjectGroup: 1 },
  { intent: 'themes', pattern: /deepest theme in (.+)/i, subjectGroup: 1 },
  { intent: 'themes', pattern: /hidden symbolism in (.+)/i, subjectGroup: 1 },
  { intent: 'theme_topic', pattern: /^(grief|friendship|identity|morality|power and control|love|revenge|justice|freedom) in (.+)/i },
  { intent: 'summary', pattern: /summary of (.+)/i, subjectGroup: 1 },
  { intent: 'summary', pattern: /explain (.+) like i(?:'m| am) \d+/i, subjectGroup: 1 },
  { intent: 'characters', pattern: /main characters in (.+)/i, subjectGroup: 1 },
  { intent: 'character', pattern: /character analysis of (.+)/i, subjectGroup: 1 },
  { intent: 'character', pattern: /protagonist vs antagonist in (.+)/i, subjectGroup: 1 },
  { intent: 'character', pattern: /character development in (.+)/i, subjectGroup: 1 },
  { intent: 'character', pattern: /defend (.+)/i, subjectGroup: 1 },
  { intent: 'ending', pattern: /(.+) ending explained/i, subjectGroup: 1 },
  { intent: 'ending', pattern: /ending of (.+) explained/i, subjectGroup: 1 },
  { intent: 'ending', pattern: /alternate ending for (.+)/i, subjectGroup: 1 },
  { intent: 'author', pattern: /author of (.+)/i, subjectGroup: 1 },
  { intent: 'author_bio', pattern: /biography of (.+)/i, subjectGroup: 1 },
  { intent: 'author_bio', pattern: /what inspired (.+) to write (.+)/i, subjectGroup: 2 },
  { intent: 'author_bio', pattern: /interviews with (.+)/i, subjectGroup: 1 },
  { intent: 'similar', pattern: /books similar to (.+)/i, subjectGroup: 1 },
  { intent: 'similar', pattern: /books like (.+)/i, subjectGroup: 1 },
  { intent: 'similar', pattern: /which book club book is most similar to (.+)/i, subjectGroup: 1 },
  { intent: 'comparison', pattern: /(.+) vs (.+)/i, subjectGroup: 1 },
  { intent: 'comparison', pattern: /(.+) compared to (.+)/i, subjectGroup: 1 },
  { intent: 'comparison', pattern: /(.+) (?:vs|versus) (?:movie|tv|film) adaptation/i, subjectGroup: 1 },
  { intent: 'comparison', pattern: /best adaptation of (.+)/i, subjectGroup: 1 },
  { intent: 'quotes', pattern: /(?:best |favorite )?quotes? from (.+)/i, subjectGroup: 1 },
  { intent: 'context', pattern: /historical context of (.+)/i, subjectGroup: 1 },
  { intent: 'context', pattern: /publication history of (.+)/i, subjectGroup: 1 },
  { intent: 'context', pattern: /awards won by (.+)/i, subjectGroup: 1 },
  { intent: 'context', pattern: /banned or challenged status of (.+)/i, subjectGroup: 1 },
  { intent: 'message', pattern: /what is the main message of (.+)/i, subjectGroup: 1 },
  { intent: 'message', pattern: /what makes (.+) a good book club pick/i, subjectGroup: 1 },
  { intent: 'symbols', pattern: /what symbols appear in (.+)/i, subjectGroup: 1 },
  { intent: 'controversy', pattern: /most controversial moment in (.+)/i, subjectGroup: 1 },
  { intent: 'opinion', pattern: /is (.+) overrated/i, subjectGroup: 1 },
  { intent: 'opinion', pattern: /unpopular opinion about (.+)/i, subjectGroup: 1 },
  { intent: 'opinion', pattern: /why do people love (.+)/i, subjectGroup: 1 },
  { intent: 'icebreaker', pattern: /what would you ask the author of (.+)/i, subjectGroup: 1 },
  { intent: 'icebreaker', pattern: /which character from (.+) are you most like/i, subjectGroup: 1 },
  { intent: 'icebreaker', pattern: /recast (.+) as a movie/i, subjectGroup: 1 },
  { intent: 'icebreaker', pattern: /what song fits (.+)/i, subjectGroup: 1 },
  { intent: 'icebreaker', pattern: /if (.+) were told from another character/i, subjectGroup: 1 },
]

function cleanSubject(raw: string): string {
  return raw
    .replace(/\?+$/, '')
    .replace(/\s+(book|novel)$/i, '')
    .trim()
}

const SEARCH_ALIASES: Record<string, string> = {
  gatsby: 'The Great Gatsby',
  'great gatsby': 'The Great Gatsby',
  odyssey: 'The Odyssey',
  iliad: 'The Iliad',
  sherlock: 'The Adventures of Sherlock Holmes',
  'sherlock holmes': 'The Adventures of Sherlock Holmes',
  holmes: 'The Adventures of Sherlock Holmes',
  frankenstein: 'Frankenstein',
  dracula: 'Dracula',
  'moby dick': 'Moby Dick',
  'the book with the whale': 'Moby Dick',
  whale: 'Moby Dick',
  'pride and prejudice': 'Pride and Prejudice',
  'pride and prejudce': 'Pride and Prejudice',
  'jane eyre': 'Jane Eyre',
  'little women': 'Little Women',
  'war and peace': 'War and Peace',
  'alice in wonderland': 'Alice in Wonderland',
  'treasure island': 'Treasure Island',
  'bleak house': 'Bleak House',
  middlemarch: 'Middlemarch',
  metamorphosis: 'Metamorphosis',
  kafka: 'Metamorphosis',
  'don quixote': 'Don Quixote',
  'anna karenina': 'Anna Karenina',
  'yellow wallpaper': 'The Yellow Wallpaper',
  'the yellow wallpaper': 'The Yellow Wallpaper',
  'sense and sensibility': 'Sense and Sensibility',
  'heart of darkness': 'Heart of Darkness',
  'wuthering heights': 'Wuthering Heights',
  'northanger abbey': 'Northanger Abbey',
  'huckleberry finn': 'Adventures of Huckleberry Finn',
  'dorian gray': 'The Picture of Dorian Gray',
  'picture of dorian gray': 'The Picture of Dorian Gray',
  'crawdads sing': 'Where the Crawdads Sing',
  'where the crawdads sing': 'Where the Crawdads Sing',
  tolstoy: 'War and Peace',
  bronte: 'Jane Eyre',
  austen: 'Pride and Prejudice',
  dickens: 'Great Expectations',
}

export function isClubSearchIntent(intent: ClubSearchIntent): boolean {
  return intent !== 'book_lookup'
}

function resolveCharacterBook(subject: string): string {
  const key = normalisePhrase(subject)
  return CHARACTER_BOOK_HINTS[key] ?? subject
}

export function resolveSearchSubject(subject: string): string {
  const trimmed = subject.trim()
  if (!trimmed) return trimmed
  const key = normalisePhrase(trimmed)
  return SEARCH_ALIASES[key] ?? resolveCharacterBook(trimmed)
}

export function parseClubSearchIntent(raw: string): ParsedClubSearch {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { raw: trimmed, intent: 'book_lookup', subject: '', secondarySubject: null, themeTopic: null }
  }

  for (const entry of INTENT_PATTERNS) {
    const match = trimmed.match(entry.pattern)
    if (!match) continue

    if (entry.intent === 'club_picks') {
      return {
        raw: trimmed,
        intent: 'club_picks',
        subject: '',
        secondarySubject: null,
        themeTopic: null,
      }
    }

    if (entry.intent === 'theme_topic') {
      const themeTopic = cleanSubject(match[1] ?? '')
      const subject = cleanSubject(match[2] ?? '')
      return {
        raw: trimmed,
        intent: 'theme_topic',
        subject,
        secondarySubject: null,
        themeTopic,
      }
    }

    if (entry.intent === 'comparison' && match[2]) {
      return {
        raw: trimmed,
        intent: 'comparison',
        subject: cleanSubject(match[1] ?? ''),
        secondarySubject: cleanSubject(match[2] ?? ''),
        themeTopic: null,
      }
    }

    const group = entry.subjectGroup ?? 1
    let subject = cleanSubject(match[group] ?? '')

    if (entry.intent === 'character') {
      subject = resolveCharacterBook(subject)
    }

    subject = resolveSearchSubject(subject)

    return {
      raw: trimmed,
      intent: entry.intent,
      subject,
      secondarySubject: null,
      themeTopic: null,
    }
  }

  const aliasMatch = SEARCH_ALIASES[normalisePhrase(trimmed)]
  if (aliasMatch) {
    return {
      raw: trimmed,
      intent: 'summary',
      subject: aliasMatch,
      secondarySubject: null,
      themeTopic: null,
    }
  }

  return {
    raw: trimmed,
    intent: 'book_lookup',
    subject: resolveSearchSubject(trimmed),
    secondarySubject: null,
    themeTopic: null,
  }
}

export function intentLabel(intent: ClubSearchIntent): string {
  const labels: Record<ClubSearchIntent, string> = {
    book_lookup: 'Book search',
    discussion: 'Discussion questions',
    themes: 'Themes',
    summary: 'Summary & orientation',
    characters: 'Main characters',
    character: 'Character analysis',
    ending: 'Ending & plot',
    author: 'Author',
    author_bio: 'Author context',
    similar: 'Similar books',
    comparison: 'Comparisons',
    quotes: 'Quotes & moments',
    context: 'Historical context',
    message: 'Main message',
    symbols: 'Symbols',
    controversy: 'Controversy',
    opinion: 'Opinions',
    icebreaker: 'Icebreakers',
    club_picks: 'Book club picks',
    theme_topic: 'Theme deep-dive',
  }
  return labels[intent]
}
