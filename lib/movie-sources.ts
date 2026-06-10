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
  // —— Classic book adaptations (public-domain sources often available) ——
  { key: 'frankenstein', title: 'Frankenstein', year: 1931, bookSearchQuery: 'Frankenstein Mary Shelley' },
  { key: 'dracula', title: 'Dracula', year: 1931, bookSearchQuery: 'Dracula Bram Stoker' },
  {
    key: 'pride and prejudice',
    title: 'Pride and Prejudice',
    year: 2005,
    bookSearchQuery: 'Pride and Prejudice Jane Austen',
  },
  { key: 'jane eyre', title: 'Jane Eyre', year: 2011, bookSearchQuery: 'Jane Eyre Charlotte Bronte' },
  {
    key: 'wuthering heights',
    title: 'Wuthering Heights',
    year: 1939,
    bookSearchQuery: 'Wuthering Heights Emily Bronte',
  },
  { key: 'moby dick', title: 'Moby Dick', year: 1956, bookSearchQuery: 'Moby Dick Herman Melville' },
  {
    key: 'the wizard of oz',
    title: 'The Wizard of Oz',
    year: 1939,
    bookSearchQuery: 'Wonderful Wizard of Oz L Frank Baum',
  },
  {
    key: 'alice in wonderland',
    title: 'Alice in Wonderland',
    year: 2010,
    bookSearchQuery: 'Alice in Wonderland Lewis Carroll',
  },
  {
    key: 'treasure island',
    title: 'Treasure Island',
    year: 1950,
    bookSearchQuery: 'Treasure Island Robert Louis Stevenson',
  },
  {
    key: 'the adventures of tom sawyer',
    title: 'The Adventures of Tom Sawyer',
    year: 1938,
    bookSearchQuery: 'Adventures of Tom Sawyer Mark Twain',
  },
  {
    key: 'adventures of huckleberry finn',
    title: 'Adventures of Huckleberry Finn',
    year: 1960,
    bookSearchQuery: 'Adventures of Huckleberry Finn Mark Twain',
  },
  {
    key: 'little women',
    title: 'Little Women',
    year: 2019,
    bookSearchQuery: 'Little Women Louisa May Alcott',
  },
  {
    key: 'the secret garden',
    title: 'The Secret Garden',
    year: 1993,
    bookSearchQuery: 'Secret Garden Frances Hodgson Burnett',
  },
  {
    key: 'anne of green gables',
    title: 'Anne of Green Gables',
    year: 1985,
    bookSearchQuery: 'Anne of Green Gables L M Montgomery',
  },
  {
    key: 'oliver twist',
    title: 'Oliver Twist',
    year: 2005,
    bookSearchQuery: 'Oliver Twist Charles Dickens',
  },
  {
    key: 'a christmas carol',
    title: 'A Christmas Carol',
    year: 1984,
    bookSearchQuery: 'Christmas Carol Charles Dickens',
  },
  {
    key: 'great expectations',
    title: 'Great Expectations',
    year: 2012,
    bookSearchQuery: 'Great Expectations Charles Dickens',
  },
  {
    key: 'a tale of two cities',
    title: 'A Tale of Two Cities',
    year: 1935,
    bookSearchQuery: 'Tale of Two Cities Charles Dickens',
  },
  {
    key: 'the picture of dorian gray',
    title: 'The Picture of Dorian Gray',
    year: 1945,
    bookSearchQuery: 'Picture of Dorian Gray Oscar Wilde',
  },
  {
    key: 'the time machine',
    title: 'The Time Machine',
    year: 1960,
    bookSearchQuery: 'Time Machine H G Wells',
  },
  {
    key: 'war of the worlds',
    title: 'War of the Worlds',
    year: 2005,
    bookSearchQuery: 'War of the Worlds H G Wells',
  },
  {
    key: 'the invisible man',
    title: 'The Invisible Man',
    year: 1933,
    bookSearchQuery: 'Invisible Man H G Wells',
  },
  {
    key: 'around the world in 80 days',
    title: 'Around the World in 80 Days',
    year: 1956,
    bookSearchQuery: 'Around the World in Eighty Days Jules Verne',
  },
  {
    key: 'journey to the center of the earth',
    title: 'Journey to the Center of the Earth',
    year: 1959,
    bookSearchQuery: 'Journey to the Center of the Earth Jules Verne',
  },
  {
    key: 'twenty thousand leagues under the sea',
    title: '20,000 Leagues Under the Sea',
    year: 1954,
    bookSearchQuery: 'Twenty Thousand Leagues Under the Sea Jules Verne',
  },
  {
    key: 'the count of monte cristo',
    title: 'The Count of Monte Cristo',
    year: 2002,
    bookSearchQuery: 'Count of Monte Cristo Alexandre Dumas',
  },
  {
    key: 'the three musketeers',
    title: 'The Three Musketeers',
    year: 1993,
    bookSearchQuery: 'Three Musketeers Alexandre Dumas',
  },
  {
    key: 'les miserables',
    title: 'Les Misérables',
    year: 2012,
    bookSearchQuery: 'Les Miserables Victor Hugo',
  },
  {
    key: 'the hunchback of notre dame',
    title: 'The Hunchback of Notre Dame',
    year: 1996,
    bookSearchQuery: 'Hunchback of Notre Dame Victor Hugo',
  },
  {
    key: 'phantom of the opera',
    title: 'The Phantom of the Opera',
    year: 2004,
    bookSearchQuery: 'Phantom of the Opera Gaston Leroux',
  },
  {
    key: 'the call of the wild',
    title: 'The Call of the Wild',
    year: 2020,
    bookSearchQuery: 'Call of the Wild Jack London',
  },
  {
    key: 'white fang',
    title: 'White Fang',
    year: 1991,
    bookSearchQuery: 'White Fang Jack London',
  },
  {
    key: 'the last of the mohicans',
    title: 'The Last of the Mohicans',
    year: 1992,
    bookSearchQuery: 'Last of the Mohicans James Fenimore Cooper',
  },
  {
    key: 'the scarlet letter',
    title: 'The Scarlet Letter',
    year: 1995,
    bookSearchQuery: 'Scarlet Letter Nathaniel Hawthorne',
  },
  {
    key: 'heart of darkness',
    title: 'Apocalypse Now',
    year: 1979,
    bookDisplayTitle: 'Heart of Darkness',
    bookSearchQuery: 'Heart of Darkness Joseph Conrad',
  },
  {
    key: 'sherlock holmes',
    title: 'Sherlock Holmes',
    year: 2009,
    bookSearchQuery: 'Adventures of Sherlock Holmes Arthur Conan Doyle',
  },
  {
    key: 'the hound of the baskervilles',
    title: 'The Hound of the Baskervilles',
    year: 1959,
    bookSearchQuery: 'Hound of the Baskervilles Arthur Conan Doyle',
  },
  {
    key: 'gone with the wind',
    title: 'Gone with the Wind',
    year: 1939,
    bookSearchQuery: 'Gone with the Wind Margaret Mitchell',
  },
  {
    key: 'ben hur',
    title: 'Ben-Hur',
    year: 1959,
    bookSearchQuery: 'Ben-Hur Lew Wallace',
  },
  {
    key: 'the maltese falcon',
    title: 'The Maltese Falcon',
    year: 1941,
    bookSearchQuery: 'Maltese Falcon Dashiell Hammett',
  },
  {
    key: 'rebecca',
    title: 'Rebecca',
    year: 1940,
    bookSearchQuery: 'Rebecca Daphne du Maurier',
  },
  {
    key: 'the great gatsby',
    title: 'The Great Gatsby',
    year: 2013,
    bookSearchQuery: 'Great Gatsby F Scott Fitzgerald',
  },

  // —— Modern bestseller & tie-in adaptations ——
  { key: 'the godfather', title: 'The Godfather', year: 1972, bookSearchQuery: 'The Godfather Mario Puzo' },
  { key: 'jaws', title: 'Jaws', year: 1975, bookSearchQuery: 'Jaws Peter Benchley' },
  {
    key: 'the silence of the lambs',
    title: 'The Silence of the Lambs',
    year: 1991,
    bookSearchQuery: 'Silence of the Lambs Thomas Harris',
  },
  {
    key: 'the shawshank redemption',
    title: 'The Shawshank Redemption',
    year: 1994,
    bookSearchQuery: 'Rita Hayworth and Shawshank Redemption Stephen King',
  },
  { key: 'the green mile', title: 'The Green Mile', year: 1999, bookSearchQuery: 'Green Mile Stephen King' },
  { key: 'the shining', title: 'The Shining', year: 1980, bookSearchQuery: 'Shining Stephen King' },
  { key: 'carrie', title: 'Carrie', year: 1976, bookSearchQuery: 'Carrie Stephen King' },
  { key: 'it', title: 'It', year: 2017, bookSearchQuery: 'It Stephen King' },
  { key: 'misery', title: 'Misery', year: 1990, bookSearchQuery: 'Misery Stephen King' },
  {
    key: 'the princess bride',
    title: 'The Princess Bride',
    year: 1987,
    bookSearchQuery: 'Princess Bride William Goldman',
  },
  { key: 'forrest gump', title: 'Forrest Gump', year: 1994, bookSearchQuery: 'Forrest Gump Winston Groom' },
  { key: 'fight club', title: 'Fight Club', year: 1999, bookSearchQuery: 'Fight Club Chuck Palahniuk' },
  {
    key: 'jurassic park',
    title: 'Jurassic Park',
    year: 1993,
    bookSearchQuery: 'Jurassic Park Michael Crichton',
  },
  {
    key: 'the lost world',
    title: 'The Lost World: Jurassic Park',
    year: 1997,
    bookSearchQuery: 'Lost World Michael Crichton',
  },
  { key: 'dune', title: 'Dune', year: 2021, bookSearchQuery: 'Dune Frank Herbert' },
  {
    key: 'blade runner',
    title: 'Blade Runner',
    year: 1982,
    bookDisplayTitle: 'Do Androids Dream of Electric Sheep?',
    bookSearchQuery: 'Do Androids Dream of Electric Sheep Philip K Dick',
  },
  {
    key: 'the hunger games',
    title: 'The Hunger Games',
    year: 2012,
    bookSearchQuery: 'Hunger Games Suzanne Collins',
  },
  {
    key: 'harry potter',
    title: 'Harry Potter and the Sorcerer\'s Stone',
    year: 2001,
    bookSearchQuery: 'Harry Potter and the Sorcerer\'s Stone J K Rowling',
  },
  {
    key: 'the lord of the rings',
    title: 'The Lord of the Rings',
    year: 2001,
    bookSearchQuery: 'Lord of the Rings J R R Tolkien',
  },
  {
    key: 'the hobbit',
    title: 'The Hobbit',
    year: 2012,
    bookSearchQuery: 'Hobbit J R R Tolkien',
  },
  {
    key: 'the chronicles of narnia',
    title: 'The Chronicles of Narnia',
    year: 2005,
    bookSearchQuery: 'Lion the Witch and the Wardrobe C S Lewis',
  },
  {
    key: 'life of pi',
    title: 'Life of Pi',
    year: 2012,
    bookSearchQuery: 'Life of Pi Yann Martel',
  },
  {
    key: 'the help',
    title: 'The Help',
    year: 2011,
    bookSearchQuery: 'The Help Kathryn Stockett',
  },
  {
    key: 'hidden figures',
    title: 'Hidden Figures',
    year: 2016,
    bookSearchQuery: 'Hidden Figures Margot Lee Shetterly',
  },
  {
    key: 'the imitation game',
    title: 'The Imitation Game',
    year: 2014,
    bookSearchQuery: 'Alan Turing Andrew Hodges',
  },
  {
    key: 'a beautiful mind',
    title: 'A Beautiful Mind',
    year: 2001,
    bookSearchQuery: 'Beautiful Mind Sylvia Nasar',
  },
  {
    key: 'schindler s list',
    title: "Schindler's List",
    year: 1993,
    bookSearchQuery: "Schindler's List Thomas Keneally",
  },
  {
    key: 'no country for old men',
    title: 'No Country for Old Men',
    year: 2007,
    bookSearchQuery: 'No Country for Old Men Cormac McCarthy',
  },
  {
    key: 'the road',
    title: 'The Road',
    year: 2009,
    bookSearchQuery: 'The Road Cormac McCarthy',
  },
  {
    key: 'there will be blood',
    title: 'There Will Be Blood',
    year: 2007,
    bookSearchQuery: 'Oil Upton Sinclair',
  },
  {
    key: 'the revenant',
    title: 'The Revenant',
    year: 2015,
    bookSearchQuery: 'Revenant Michael Punke',
  },
  {
    key: 'arrival',
    title: 'Arrival',
    year: 2016,
    bookDisplayTitle: 'Story of Your Life',
    bookSearchQuery: 'Stories of Your Life Ted Chiang',
  },
  {
    key: 'the exorcist',
    title: 'The Exorcist',
    year: 1973,
    bookSearchQuery: 'Exorcist William Peter Blatty',
  },
  {
    key: 'rosemary s baby',
    title: "Rosemary's Baby",
    year: 1968,
    bookSearchQuery: "Rosemary's Baby Ira Levin",
  },
  {
    key: 'the birds',
    title: 'The Birds',
    year: 1963,
    bookSearchQuery: 'Birds Daphne du Maurier',
  },
  {
    key: 'psycho',
    title: 'Psycho',
    year: 1960,
    bookSearchQuery: 'Psycho Robert Bloch',
  },
  {
    key: 'the godfather part ii',
    title: 'The Godfather Part II',
    year: 1974,
    bookSearchQuery: 'Godfather Mario Puzo',
  },
  {
    key: 'goodfellas',
    title: 'Goodfellas',
    year: 1990,
    bookDisplayTitle: 'Wiseguy',
    bookSearchQuery: 'Wiseguy Nicholas Pileggi',
  },
  {
    key: 'to kill a mockingbird',
    title: 'To Kill a Mockingbird',
    year: 1962,
    bookSearchQuery: 'To Kill a Mockingbird Harper Lee',
  },
  {
    key: 'the color purple',
    title: 'The Color Purple',
    year: 1985,
    bookSearchQuery: 'Color Purple Alice Walker',
  },
  {
    key: 'charlie and the chocolate factory',
    title: 'Charlie and the Chocolate Factory',
    year: 2005,
    bookSearchQuery: 'Charlie and the Chocolate Factory Roald Dahl',
  },
  {
    key: 'matilda',
    title: 'Matilda',
    year: 1996,
    bookSearchQuery: 'Matilda Roald Dahl',
  },
  {
    key: 'the bfg',
    title: 'The BFG',
    year: 2016,
    bookSearchQuery: 'BFG Roald Dahl',
  },
  {
    key: 'where the wild things are',
    title: 'Where the Wild Things Are',
    year: 2009,
    bookSearchQuery: 'Where the Wild Things Are Maurice Sendak',
  },
  {
    key: 'cloud atlas',
    title: 'Cloud Atlas',
    year: 2012,
    bookSearchQuery: 'Cloud Atlas David Mitchell',
  },
  {
    key: 'the kite runner',
    title: 'The Kite Runner',
    year: 2007,
    bookSearchQuery: 'Kite Runner Khaled Hosseini',
  },
  {
    key: 'room',
    title: 'Room',
    year: 2015,
    bookSearchQuery: 'Room Emma Donoghue',
  },
  {
    key: 'the girl on the train',
    title: 'The Girl on the Train',
    year: 2016,
    bookSearchQuery: 'Girl on the Train Paula Hawkins',
  },
  {
    key: 'gone girl',
    title: 'Gone Girl',
    year: 2014,
    bookSearchQuery: 'Gone Girl Gillian Flynn',
  },
  {
    key: 'the da vinci code',
    title: 'The Da Vinci Code',
    year: 2006,
    bookSearchQuery: 'Da Vinci Code Dan Brown',
  },
  {
    key: 'angels and demons',
    title: 'Angels & Demons',
    year: 2009,
    bookSearchQuery: 'Angels and Demons Dan Brown',
  },
  {
    key: 'the firm',
    title: 'The Firm',
    year: 1993,
    bookSearchQuery: 'The Firm John Grisham',
  },
  {
    key: 'the pelican brief',
    title: 'The Pelican Brief',
    year: 1993,
    bookSearchQuery: 'Pelican Brief John Grisham',
  },
  {
    key: 'a time to kill',
    title: 'A Time to Kill',
    year: 1996,
    bookSearchQuery: 'Time to Kill John Grisham',
  },

  // —— Films with weak or no tie-in novel (source search only) ——
  {
    key: 'pulp fiction',
    title: 'Pulp Fiction',
    year: 1994,
    bookSearchQuery: 'Pulp Fiction film screenplay',
    searchOnly: true,
  },
  {
    key: 'the matrix',
    title: 'The Matrix',
    year: 1999,
    bookSearchQuery: 'Matrix film book',
    searchOnly: true,
  },
  {
    key: 'inception',
    title: 'Inception',
    year: 2010,
    bookSearchQuery: 'Inception film book',
    searchOnly: true,
  },
  {
    key: 'frozen',
    title: 'Frozen',
    year: 2013,
    bookSearchQuery: 'Frozen Disney novelization',
    searchOnly: true,
  },
  {
    key: 'frozen river',
    title: 'Frozen River',
    year: 2008,
    bookDisplayTitle: 'Frozen River (no tie-in novel)',
    bookSearchQuery: 'Frozen River 2008 film',
    searchOnly: true,
  },
  {
    key: 'titanic',
    title: 'Titanic',
    year: 1997,
    bookDisplayTitle: "James Cameron's Titanic",
    bookSearchQuery: "James Cameron's Titanic Ed Marsh",
    searchOnly: true,
  },
  {
    key: 'star wars',
    title: 'Star Wars',
    year: 1977,
    bookSearchQuery: 'Star Wars George Lucas novel',
    searchOnly: true,
  },
  {
    key: 'the dark knight',
    title: 'The Dark Knight',
    year: 2008,
    bookSearchQuery: 'Dark Knight Batman comic',
    searchOnly: true,
  },
  {
    key: 'avengers',
    title: 'The Avengers',
    year: 2012,
    bookSearchQuery: 'Avengers Marvel comic',
    searchOnly: true,
  },
  {
    key: 'top gun',
    title: 'Top Gun',
    year: 1986,
    bookSearchQuery: 'Top Gun film book',
    searchOnly: true,
  },
  {
    key: 'die hard',
    title: 'Die Hard',
    year: 1988,
    bookSearchQuery: 'Nothing Lasts Forever Roderick Thorp',
  },
  {
    key: 'raiders of the lost ark',
    title: 'Raiders of the Lost Ark',
    year: 1981,
    bookSearchQuery: 'Raiders of the Lost Ark novelization',
    searchOnly: true,
  },
  {
    key: 'e t',
    title: 'E.T. the Extra-Terrestrial',
    year: 1982,
    bookSearchQuery: 'E T novelization',
    searchOnly: true,
  },
  {
    key: 'back to the future',
    title: 'Back to the Future',
    year: 1985,
    bookSearchQuery: 'Back to the Future novelization',
    searchOnly: true,
  },
  {
    key: 'ghostbusters',
    title: 'Ghostbusters',
    year: 1984,
    bookSearchQuery: 'Ghostbusters novelization',
    searchOnly: true,
  },
  {
    key: 'parasite',
    title: 'Parasite',
    year: 2019,
    bookSearchQuery: 'Parasite 2019 film screenplay',
    searchOnly: true,
  },
  {
    key: 'everything everywhere all at once',
    title: 'Everything Everywhere All at Once',
    year: 2022,
    bookSearchQuery: 'Everything Everywhere All at Once film',
    searchOnly: true,
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
