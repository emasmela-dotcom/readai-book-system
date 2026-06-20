import { CURATED_CLASSICS } from '@/lib/curated-classics'
import { getDailyClubPicks } from '@/lib/daily-club-picks'
import { normalisePhrase } from '@/lib/book-search'
import { intentLabel, type ClubSearchIntent, type ParsedClubSearch } from '@/lib/club-search-intent'

export type ClubGuideBook = {
  title: string
  author: string | null
  subjects: string[]
}

export type ClubSearchGuide = {
  intent: ClubSearchIntent
  intentLabel: string
  heading: string
  items: string[]
  note: string | null
  similarBooks: { title: string; author: string }[]
}

function bookLabel(book: ClubGuideBook): string {
  return book.author ? `${book.title} by ${book.author}` : book.title
}

function findCurated(title: string): (typeof CURATED_CLASSICS)[number] | null {
  const norm = normalisePhrase(title)
  for (const entry of CURATED_CLASSICS) {
    const entryNorm = normalisePhrase(entry.title)
    if (entryNorm === norm || entryNorm.includes(norm) || norm.includes(entryNorm.split(' ')[0] ?? '')) {
      return entry
    }
  }
  return null
}

function similarFromCurated(title: string, limit = 5): { title: string; author: string }[] {
  const source = findCurated(title)
  if (!source) {
    return CURATED_CLASSICS.map((entry) => ({ title: entry.title, author: entry.author }))
      .filter((b) => normalisePhrase(b.title) !== normalisePhrase(title))
      .slice(0, limit)
  }

  const sourceSubjects = new Set(source.subjects.map((s) => s.toLowerCase()))
  const scored = CURATED_CLASSICS.map((entry) => {
    if (entry.id === source.id) return { entry, score: -1 }
    const overlap = entry.subjects.filter((s) =>
      sourceSubjects.has(s.toLowerCase()) || [...sourceSubjects].some((ss) => s.toLowerCase().includes(ss.split(' ')[0] ?? '')),
    ).length
    return { entry, score: overlap }
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map(({ entry }) => ({ title: entry.title, author: entry.author }))
}

function subjectHints(book: ClubGuideBook): string[] {
  const curated = findCurated(book.title)
  if (curated) return [...curated.subjects]
  return book.subjects
}

function buildDiscussion(book: ClubGuideBook): string[] {
  const label = bookLabel(book)
  const hints = subjectHints(book)
  const items = [
    `What first drew you to ${book.title}? Would you recommend it to this group?`,
    `Which character in ${book.title} surprised you most — and what does that reveal about ${book.author ?? 'the author'}'s choices?`,
    `Where does the story's tension peak? Did that moment feel earned?`,
    `How does the setting shape the mood of ${book.title}?`,
    `Does the ending satisfy you? What would you ask ${book.author ?? 'the author'} to clarify?`,
    `If you could discuss one scene with someone who hasn't read it, which would you pick?`,
  ]
  if (hints.length > 0) {
    items.push(`Given its ${hints.slice(0, 2).join(' / ')} threads — which theme sparked the liveliest debate in your group?`)
  }
  items.push(`Who in ${label} is most misunderstood, and why?`)
  return items
}

function buildThemes(book: ClubGuideBook, themeTopic: string | null): string[] {
  const hints = subjectHints(book)
  const items: string[] = []

  if (themeTopic) {
    items.push(
      `Where does ${themeTopic} appear most clearly in ${book.title}?`,
      `Which character embodies ${themeTopic} — or resists it?`,
      `Does ${book.author ?? 'the author'} treat ${themeTopic} as tragedy, irony, or hope?`,
      `How would the story change if ${themeTopic} were absent?`,
      `Compare two scenes where ${themeTopic} is foregrounded vs. hidden.`,
    )
  }

  if (hints.length > 0) {
    for (const hint of hints.slice(0, 4)) {
      items.push(`Track how “${hint.replace(' -- Fiction', '')}” shows up across the opening, middle, and ending.`)
    }
  }

  items.push(
    `What is the central question ${book.title} refuses to answer cleanly?`,
    `Which symbols or repeated images carry the deepest meaning?`,
    `How do form and genre (epistolary, adventure, romance, etc.) reinforce the themes?`,
  )
  return items.slice(0, 8)
}

function buildSummary(book: ClubGuideBook): string[] {
  const hints = subjectHints(book)
  return [
    `${book.title}${book.author ? ` by ${book.author}` : ''} — use this as club orientation, not a substitute for reading.`,
    hints.length > 0 ? `Catalog subjects include: ${hints.join(', ')}.` : `Start by noting the era, setting, and narrator.`,
    `Identify the protagonist's want vs. need before your meeting.`,
    `Mark three turning points: the invitation, the crisis, and the resolution.`,
    `Ask: what world does the opening chapter establish, and how is that world broken by the end?`,
    `Compare your group's one-sentence summary — disagreement is useful fuel for discussion.`,
  ]
}

function buildCharacters(book: ClubGuideBook): string[] {
  return [
    `Who changes the most from first page to last in ${book.title}?`,
    `Who is the moral center — and is the author asking you to trust them?`,
    `Map each major character's goal, obstacle, and secret.`,
    `Which relationship drives the plot more than any single event?`,
    `Who would you cast for a faithful adaptation, and why?`,
    `Which minor character deserves more page time?`,
  ]
}

function buildCharacterAnalysis(book: ClubGuideBook, parsed: ParsedClubSearch): string[] {
  const character = parsed.raw.match(/character analysis of (.+)/i)?.[1]?.replace(/\?+$/, '').trim()
  const name = character ?? parsed.subject
  return [
    `What does ${name} want at the start of ${book.title}?`,
    `What fear or flaw most limits ${name}?`,
    `Which scene best reveals ${name}'s true values?`,
    `How do other characters mirror or oppose ${name}?`,
    `Does ${name} earn their ending? Would you defend their choices to the group?`,
    `If ${name} narrated the book, what would we learn that we miss now?`,
  ]
}

function buildEnding(book: ClubGuideBook): string[] {
  return [
    `Does the ending of ${book.title} resolve the central conflict or deliberately leave it open?`,
    `Which clues earlier in the book foreshadow the final chapters?`,
    `Who gains and who loses by the last page?`,
    `Would an alternate ending improve the book — or betray its themes?`,
    `What question should your club ask about the final scene?`,
  ]
}

function buildAuthor(book: ClubGuideBook): string[] {
  return book.author
    ? [
        `${book.title} is by ${book.author}.`,
        `What other works by ${book.author} share its tone or concerns?`,
        `How does biography (era, politics, personal history) illuminate this book?`,
        `Find one interview or essay by ${book.author} — what do they say about craft or intent?`,
      ]
    : [`Identify the author of ${book.title} and read one short biography before your meeting.`]
}

function buildAuthorBio(book: ClubGuideBook): string[] {
  const author = book.author ?? parsedAuthorFromQuery(book.title)
  return [
    `Research ${author}'s life timeline: formative years, major works, cultural moment.`,
    `What historical events shaped ${author}'s writing?`,
    `Which contemporaries did ${author} admire or argue with?`,
    `How does ${book.title} fit in ${author}'s career — early experiment or mature statement?`,
    `What do critics consistently praise or challenge about ${author}?`,
  ]
}

function parsedAuthorFromQuery(title: string): string {
  return title
}

function buildSimilar(book: ClubGuideBook, similar: { title: string; author: string }[]): string[] {
  if (similar.length === 0) {
    return [`Search classic public-domain titles in the same genre as ${book.title}.`]
  }
  return similar.map((entry) => `${entry.title} — ${entry.author}`)
}

function buildComparison(book: ClubGuideBook, secondary: string | null): string[] {
  const other = secondary ?? 'the adaptation'
  return [
    `Compare plot fidelity: what does ${book.title} include that ${other} omits?`,
    `Which medium (page vs. screen) handles interiority better?`,
    `How do casting and visual style change your sympathy for characters?`,
    `What themes survive the adaptation — and which are flattened?`,
    `Would you recommend watching ${other} before or after the book club meeting?`,
  ]
}

function buildQuotes(book: ClubGuideBook): string[] {
  return [
    `Each member: bring one short passage from ${book.title} that stuck with you.`,
    `Find a line that captures the book's voice in a single sentence.`,
    `Share a quote that aged badly — discuss why.`,
    `Which line would you put on the club poster?`,
    `Read quotes aloud; notice how rhythm and repetition build meaning.`,
  ]
}

function buildContext(book: ClubGuideBook): string[] {
  return [
    `When was ${book.title} first published, and for what audience?`,
    `What political, social, or technological changes surrounded its release?`,
    `Was it serialized, censored, or revised after publication?`,
    `How did contemporary reviewers receive it?`,
    `What would modern readers misunderstand without historical context?`,
  ]
}

function buildMessage(book: ClubGuideBook): string[] {
  return [
    `In one sentence, what is ${book.title} arguing about human nature?`,
    `Who learns something by the end — reader, character, or both?`,
    `Does the book endorse its protagonist's worldview, or critique it?`,
    `Why is ${book.title} a strong book club pick: accessibility, debate, length, or relevance?`,
  ]
}

function buildSymbols(book: ClubGuideBook): string[] {
  return [
    `List recurring objects, colors, weather, or places in ${book.title}.`,
    `Which symbol appears at both the opening and the climax?`,
    `Are symbols literal (plot devices) or atmospheric (mood)?`,
    `Do any symbols contradict each other — and why?`,
  ]
}

function buildControversy(book: ClubGuideBook): string[] {
  return [
    `Which scene in ${book.title} divides readers most?`,
    `Is the controversy about morality, craft, representation, or pacing?`,
    `Can your group disagree without talking past each other?`,
    `Does the book invite controversy on purpose?`,
  ]
}

function buildOpinion(book: ClubGuideBook): string[] {
  return [
    `Make the best case that ${book.title} is overrated — then defend it.`,
    `Share an unpopular opinion; others respond with evidence from the text.`,
    `Why do people love this book? Name three non-generic reasons.`,
    `What did you miss on first read that changed your opinion later?`,
  ]
}

function buildIcebreaker(book: ClubGuideBook): string[] {
  return [
    `Which character from ${book.title} are you most like — honestly?`,
    `What one question would you ask ${book.author ?? 'the author'} at dinner?`,
    `Pitch a dream cast for a film of ${book.title}.`,
    `Pick a song that fits a key scene — play 30 seconds for the group.`,
    `Retell one chapter from another character's point of view.`,
  ]
}

export async function buildClubPicksGuide(parsed: ParsedClubSearch): Promise<ClubSearchGuide> {
  const picks = await getDailyClubPicks()
  return {
    intent: 'club_picks',
    intentLabel: intentLabel('club_picks'),
    heading: 'Strong public-domain book club picks',
    items: picks.map((book) => `${book.title} — ${book.author}`),
    note: 'Eight full public-domain reads — new set daily from Project Gutenberg and your club library. Search any title to open the book and club prompts.',
    similarBooks: picks,
  }
}

/** Last resort — never send the user away empty-handed. */
export async function buildFallbackSearchGuide(query: string): Promise<ClubSearchGuide> {
  const trimmed = query.trim().slice(0, 80)
  const picks = await getDailyClubPicks()
  return {
    intent: 'club_picks',
    intentLabel: 'Start here',
    heading: trimmed ? `Try these for “${trimmed}”` : 'Try these book club picks',
    items: [
      ...picks.map((book) => `${book.title} — ${book.author}`),
      'Search an exact title — e.g. Pride and Prejudice, Frankenstein, Dracula',
      'Ask a club question — e.g. discussion questions for Jane Eyre',
    ],
    note: 'Pick a title above and search again for discussion prompts and a full read when available.',
    similarBooks: picks,
  }
}

export function buildClubSearchGuide(
  parsed: ParsedClubSearch,
  book: ClubGuideBook | null,
): ClubSearchGuide | null {
  const intent = parsed.intent

  if (intent === 'club_picks') {
    throw new Error('Use buildClubPicksGuide() for club_picks intent')
  }

  if (!book?.title?.trim()) return null

  const similar = similarFromCurated(book.title)

  let items: string[] = []
  let note: string | null =
    'These prompts are starting points for your club — cite passages from the book when you meet.'

  switch (intent) {
    case 'discussion':
      items = buildDiscussion(book)
      break
    case 'themes':
    case 'theme_topic':
      items = buildThemes(book, parsed.themeTopic)
      break
    case 'summary':
      items = buildSummary(book)
      note = 'Read the book for full detail — this orients your club before meeting.'
      break
    case 'characters':
      items = buildCharacters(book)
      break
    case 'character':
      items = buildCharacterAnalysis(book, parsed)
      break
    case 'ending':
      items = buildEnding(book)
      break
    case 'author':
      items = buildAuthor(book)
      break
    case 'author_bio':
      items = buildAuthorBio(book)
      break
    case 'similar':
      items = buildSimilar(book, similar)
      note = 'Similar readable classics in ReadAI — search any title to open.'
      break
    case 'comparison':
      items = buildComparison(book, parsed.secondarySubject)
      break
    case 'quotes':
      items = buildQuotes(book)
      break
    case 'context':
      items = buildContext(book)
      break
    case 'message':
      items = buildMessage(book)
      break
    case 'symbols':
      items = buildSymbols(book)
      break
    case 'controversy':
      items = buildControversy(book)
      break
    case 'opinion':
      items = buildOpinion(book)
      break
    case 'icebreaker':
      items = buildIcebreaker(book)
      break
    case 'book_lookup':
      return null
    default:
      items = buildDiscussion(book)
  }

  const heading =
    intent === 'similar'
      ? `Books similar to ${book.title}`
      : `${intentLabel(intent)} · ${book.title}`

  return {
    intent,
    intentLabel: intentLabel(intent),
    heading,
    items,
    note,
    similarBooks: intent === 'similar' ? similar : [],
  }
}
