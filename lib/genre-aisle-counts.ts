import { BOOKSTORE_AISLES } from '@/lib/bookstore-sections'
import { fetchGenreSourceCountsForAisles } from '@/lib/genre-source-shelves'

export interface GenreAisleListing {
  id: string
  title: string
  tagline: string
  /** Titles discoverable via connected sources in this room. */
  count: number
}

export async function fetchGenreAisleListings(): Promise<GenreAisleListing[]> {
  const aisleIds = BOOKSTORE_AISLES.map((aisle) => aisle.id)
  const counts = await fetchGenreSourceCountsForAisles(aisleIds)

  return BOOKSTORE_AISLES.map((aisle) => ({
    id: aisle.id,
    title: aisle.title,
    tagline: aisle.tagline,
    count: counts.get(aisle.id) ?? 0,
  }))
}

export function totalTitlesViaSources(listings: GenreAisleListing[]): number {
  return listings.reduce((sum, listing) => sum + listing.count, 0)
}
