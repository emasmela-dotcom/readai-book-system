import type { MetadataRoute } from 'next'
import { fetchCookingShelfBooks } from '@/lib/aisle-shelf-books'

const base = 'https://www.readai365.com'

/** Rebuild regularly so Google sees new public cookbook pages. */
export const revalidate = 3600

type SitemapEntry = MetadataRoute.Sitemap[number]

function pairedEntry(
  enPath: string,
  esPath: string,
  now: Date,
  changeFrequency: SitemapEntry['changeFrequency'],
  priority: number,
): SitemapEntry[] {
  const enUrl = enPath === '/' ? base : `${base}${enPath}`
  const esUrl = `${base}${esPath}`
  const languages = {
    en: enUrl,
    es: esUrl,
    'x-default': enUrl,
  }

  return [
    {
      url: enUrl,
      lastModified: now,
      changeFrequency,
      priority,
      alternates: { languages },
    },
    {
      url: esUrl,
      lastModified: now,
      changeFrequency,
      priority,
      alternates: { languages },
    },
  ]
}

function staticRoutes(now: Date): MetadataRoute.Sitemap {
  return [
    ...pairedEntry('/', '/es', now, 'daily', 1),
    ...pairedEntry('/sources', '/es/sources', now, 'weekly', 0.9),
    ...pairedEntry('/genres/cooking', '/es/genres/cooking', now, 'daily', 0.85),
    ...pairedEntry('/support', '/es/support', now, 'monthly', 0.5),
    ...pairedEntry('/subscribe', '/es/subscribe', now, 'monthly', 0.6),
    ...pairedEntry('/sign-up', '/es/sign-up', now, 'monthly', 0.6),
    ...pairedEntry('/sign-in', '/es/sign-in', now, 'monthly', 0.4),
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

async function cookingBookEntries(now: Date): Promise<MetadataRoute.Sitemap> {
  const timeoutMs = 8000
  const result = await Promise.race([
    fetchCookingShelfBooks(200, 0),
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), timeoutMs)
    }),
  ])

  if (!result) return []

  const entries: MetadataRoute.Sitemap = []
  for (const book of result.rows) {
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
  return entries
}

/** Public pages only — locked club rooms stay out of the sitemap. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  let entries: MetadataRoute.Sitemap = staticRoutes(now)

  try {
    const bookEntries = await cookingBookEntries(now)
    entries = entries.concat(bookEntries)
  } catch {
    // Keep the static map if the database is briefly unavailable.
  }

  return entries
}
