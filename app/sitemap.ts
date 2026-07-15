import type { MetadataRoute } from 'next'

const base = 'https://www.readai365.com'

/** Public pages only — locked club rooms stay out of the sitemap. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

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
      changeFrequency: 'weekly',
      priority: 0.8,
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
  ]
}
