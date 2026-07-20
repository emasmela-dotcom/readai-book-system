import { fetchCookingShelfBooks } from '@/lib/aisle-shelf-books'

export const runtime = 'nodejs'
export const revalidate = 3600

const base = 'https://www.readai365.com'

type StaticPage = { path: string; changefreq: string; priority: string }

const STATIC_PAGES: StaticPage[] = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/sources', changefreq: 'weekly', priority: '0.9' },
  { path: '/genres/cooking', changefreq: 'daily', priority: '0.85' },
  { path: '/support', changefreq: 'monthly', priority: '0.5' },
  { path: '/subscribe', changefreq: 'monthly', priority: '0.6' },
  { path: '/sign-up', changefreq: 'monthly', priority: '0.6' },
  { path: '/sign-in', changefreq: 'monthly', priority: '0.4' },
  { path: '/forgot-password', changefreq: 'yearly', priority: '0.2' },
  { path: '/llms.txt', changefreq: 'monthly', priority: '0.3' },
]

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function urlXml(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return [
    '<url>',
    `<loc>${escapeXml(loc)}</loc>`,
    `<lastmod>${lastmod}</lastmod>`,
    `<changefreq>${changefreq}</changefreq>`,
    `<priority>${priority}</priority>`,
    '</url>',
  ].join('')
}

function staticXml(lastmod: string): string {
  return STATIC_PAGES.map((page) => {
    const loc = page.path === '/' ? base : `${base}${page.path}`
    return urlXml(loc, lastmod, page.changefreq, page.priority)
  }).join('')
}

async function cookingXml(lastmod: string): Promise<string> {
  try {
    const timeout = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 5000)
    })
    const result = await Promise.race([fetchCookingShelfBooks(200, 0), timeout])
    if (!result) return ''

    return result.rows
      .flatMap((book) => [
        urlXml(`${base}/books/${book.id}`, lastmod, 'weekly', '0.7'),
        urlXml(`${base}/books/${book.id}/read`, lastmod, 'weekly', '0.65'),
      ])
      .join('')
  } catch {
    return ''
  }
}

export async function GET() {
  const lastmod = new Date().toISOString()
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml(lastmod)}
${await cookingXml(lastmod)}
</urlset>`

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
