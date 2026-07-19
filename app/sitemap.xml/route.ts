import { fetchCookingShelfBooks } from '@/lib/aisle-shelf-books'

export const runtime = 'nodejs'
export const revalidate = 3600

const base = 'https://www.readai365.com'

type Pair = { enPath: string; esPath: string; changefreq: string; priority: string }

const PAIRS: Pair[] = [
  { enPath: '/', esPath: '/es', changefreq: 'daily', priority: '1.0' },
  { enPath: '/sources', esPath: '/es/sources', changefreq: 'weekly', priority: '0.9' },
  { enPath: '/genres/cooking', esPath: '/es/genres/cooking', changefreq: 'daily', priority: '0.85' },
  { enPath: '/support', esPath: '/es/support', changefreq: 'monthly', priority: '0.5' },
  { enPath: '/subscribe', esPath: '/es/subscribe', changefreq: 'monthly', priority: '0.6' },
  { enPath: '/sign-up', esPath: '/es/sign-up', changefreq: 'monthly', priority: '0.6' },
  { enPath: '/sign-in', esPath: '/es/sign-in', changefreq: 'monthly', priority: '0.4' },
]

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function urlXml(
  loc: string,
  lastmod: string,
  changefreq: string,
  priority: string,
  languages?: { en: string; es: string; xDefault: string },
): string {
  const alternates = languages
    ? [
        `<xhtml:link rel="alternate" hreflang="en" href="${escapeXml(languages.en)}" />`,
        `<xhtml:link rel="alternate" hreflang="es" href="${escapeXml(languages.es)}" />`,
        `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(languages.xDefault)}" />`,
      ].join('')
    : ''

  return [
    '<url>',
    `<loc>${escapeXml(loc)}</loc>`,
    alternates,
    `<lastmod>${lastmod}</lastmod>`,
    `<changefreq>${changefreq}</changefreq>`,
    `<priority>${priority}</priority>`,
    '</url>',
  ].join('')
}

function staticXml(lastmod: string): string {
  const chunks: string[] = []

  for (const pair of PAIRS) {
    const enUrl = pair.enPath === '/' ? base : `${base}${pair.enPath}`
    const esUrl = `${base}${pair.esPath}`
    const languages = { en: enUrl, es: esUrl, xDefault: enUrl }
    chunks.push(urlXml(enUrl, lastmod, pair.changefreq, pair.priority, languages))
    chunks.push(urlXml(esUrl, lastmod, pair.changefreq, pair.priority, languages))
  }

  chunks.push(urlXml(`${base}/forgot-password`, lastmod, 'yearly', '0.2'))
  chunks.push(urlXml(`${base}/llms.txt`, lastmod, 'monthly', '0.3'))
  return chunks.join('')
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
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
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
