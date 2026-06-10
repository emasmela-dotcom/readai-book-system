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
  {
    id: 'time',
    label: 'TIME',
    tagline: 'News, politics, and culture from one of the world’s best-known weeklies.',
    href: 'https://time.com/',
    access: 'news',
  },
  {
    id: 'newsweek',
    label: 'Newsweek',
    tagline: 'Global news, analysis, and opinion.',
    href: 'https://www.newsweek.com/',
    access: 'news',
  },
  {
    id: 'the-week',
    label: 'The Week',
    tagline: 'Curated news and commentary from around the world.',
    href: 'https://theweek.com/',
    access: 'news',
  },
  {
    id: 'economist',
    label: 'The Economist',
    tagline: 'International business, finance, and geopolitics.',
    href: 'https://www.economist.com/',
    access: 'subscribe',
  },
  {
    id: 'foreign-affairs',
    label: 'Foreign Affairs',
    tagline: 'Serious analysis of global politics and strategy.',
    href: 'https://www.foreignaffairs.com/',
    access: 'subscribe',
  },
  {
    id: 'nyt-magazine',
    label: 'The New York Times Magazine',
    tagline: 'Long-form reporting, profiles, and Sunday features.',
    href: 'https://www.nytimes.com/section/magazine',
    access: 'subscribe',
  },
  {
    id: 'vanity-fair',
    label: 'Vanity Fair',
    tagline: 'Culture, power, Hollywood, and investigative features.',
    href: 'https://www.vanityfair.com/',
    access: 'subscribe',
  },
  {
    id: 'wired',
    label: 'WIRED',
    tagline: 'Technology, science, business, and how the future is built.',
    href: 'https://www.wired.com/',
    access: 'subscribe',
  },
  {
    id: 'mit-tech-review',
    label: 'MIT Technology Review',
    tagline: 'Emerging tech, AI, climate, and innovation reporting.',
    href: 'https://www.technologyreview.com/',
    access: 'subscribe',
  },
  {
    id: 'national-geographic',
    label: 'National Geographic',
    tagline: 'Science, nature, exploration, and photography.',
    href: 'https://www.nationalgeographic.com/magazine/',
    access: 'subscribe',
  },
  {
    id: 'scientific-american',
    label: 'Scientific American',
    tagline: 'Science news and explainers for curious readers.',
    href: 'https://www.scientificamerican.com/magazine/',
    access: 'subscribe',
  },
  {
    id: 'new-scientist',
    label: 'New Scientist',
    tagline: 'Weekly science and technology discovery.',
    href: 'https://www.newscientist.com/',
    access: 'subscribe',
  },
  {
    id: 'smithsonian',
    label: 'Smithsonian Magazine',
    tagline: 'History, science, arts, and culture from the Smithsonian.',
    href: 'https://www.smithsonianmag.com/',
    access: 'subscribe',
  },
  {
    id: 'gq',
    label: 'GQ',
    tagline: 'Men’s style, culture, fitness, and entertainment.',
    href: 'https://www.gq.com/',
    access: 'subscribe',
  },
  {
    id: 'esquire',
    label: 'Esquire',
    tagline: 'Men’s lifestyle, politics, fiction, and profiles.',
    href: 'https://www.esquire.com/',
    access: 'subscribe',
  },
  {
    id: 'mens-health',
    label: "Men's Health",
    tagline: 'Fitness, nutrition, gear, and wellbeing for men.',
    href: 'https://www.menshealth.com/',
    access: 'subscribe',
  },
  {
    id: 'mens-journal',
    label: "Men's Journal",
    tagline: 'Adventure, travel, gear, and active lifestyle for men.',
    href: 'https://www.mensjournal.com/',
    access: 'subscribe',
  },
  {
    id: 'vogue',
    label: 'Vogue',
    tagline: 'Fashion, beauty, culture, and runway coverage.',
    href: 'https://www.vogue.com/',
    access: 'subscribe',
  },
  {
    id: 'elle',
    label: 'Elle',
    tagline: 'Fashion, beauty, and women’s culture worldwide.',
    href: 'https://www.elle.com/',
    access: 'subscribe',
  },
  {
    id: 'cosmopolitan',
    label: 'Cosmopolitan',
    tagline: 'Lifestyle, relationships, beauty, and pop culture.',
    href: 'https://www.cosmopolitan.com/',
    access: 'subscribe',
  },
  {
    id: 'harpers-bazaar',
    label: "Harper's Bazaar",
    tagline: 'High fashion, art, and culture for a global audience.',
    href: 'https://www.harpersbazaar.com/',
    access: 'subscribe',
  },
  {
    id: 'rolling-stone',
    label: 'Rolling Stone',
    tagline: 'Music, film, politics, and cultural commentary.',
    href: 'https://www.rollingstone.com/',
    access: 'subscribe',
  },
  {
    id: 'billboard',
    label: 'Billboard',
    tagline: 'Charts, artists, and the business of music.',
    href: 'https://www.billboard.com/',
    access: 'news',
  },
  {
    id: 'entertainment-weekly',
    label: 'Entertainment Weekly',
    tagline: 'TV, film, books, and pop-culture coverage.',
    href: 'https://ew.com/',
    access: 'subscribe',
  },
  {
    id: 'people',
    label: 'People',
    tagline: 'Celebrity news, human-interest stories, and culture.',
    href: 'https://www.people.com/',
    access: 'news',
  },
  {
    id: 'sports-illustrated',
    label: 'Sports Illustrated',
    tagline: 'Sports news, features, and photography.',
    href: 'https://www.si.com/',
    access: 'subscribe',
  },
  {
    id: 'bloomberg-businessweek',
    label: 'Bloomberg Businessweek',
    tagline: 'Business, markets, and the global economy.',
    href: 'https://www.bloomberg.com/businessweek',
    access: 'subscribe',
  },
  {
    id: 'readers-digest',
    label: "Reader's Digest",
    tagline: 'Stories, advice, humor, and everyday inspiration.',
    href: 'https://www.rd.com/',
    access: 'subscribe',
  },
  {
    id: 'architectural-digest',
    label: 'Architectural Digest',
    tagline: 'Design, interiors, architecture, and luxury homes.',
    href: 'https://www.architecturaldigest.com/',
    access: 'subscribe',
  },
  {
    id: 'bon-appetit',
    label: 'Bon Appétit',
    tagline: 'Recipes, restaurants, and home cooking culture.',
    href: 'https://www.bonappetit.com/',
    access: 'subscribe',
  },
  {
    id: 'food-and-wine',
    label: 'Food & Wine',
    tagline: 'Cooking, dining, travel, and wine.',
    href: 'https://www.foodandwine.com/',
    access: 'subscribe',
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
