import type { MetadataRoute } from 'next'
import { fetchCookingShelfBooks } from '@/lib/aisle-shelf-books'

const base = 'https://www.readai365.com'

/** Rebuild regularly so Google sees new public cookbook pages. */
export const revalidate = 3600

function staticRoutes(now: Date): MetadataRoute.Sitemap {
  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${base}/sources`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${base}/genres/cooking`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${base}/support`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${base}/subscribe`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${base}/sign-up`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${base}/sign-in`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${base}/forgot-password`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${base}/llms.txt`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]
}

/** Public pages only — locked club rooms stay out of the sitemap. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries = staticRoutes(now)

  try {
    const { rows } = await fetchCookingShelfBooks(200, 0)
    for (const book of rows) {
      entries.push({
        url: `${base}/books/${book.id}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
      entries.push({
        url: `${base}/books/${book.id}/read`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.65,
      })
    }
  } catch {
    // Keep the static map if the database is briefly unavailable.
  }

  return entries
}
