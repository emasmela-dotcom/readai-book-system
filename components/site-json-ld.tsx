const siteUrl = 'https://www.readai365.com'

export function SiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'ReadAI365',
        url: siteUrl,
        description:
          'Search any book title and find legal places to read it online. Book discovery and reading rooms with a free trial.',
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: 'ReadAI365',
        url: siteUrl,
        description:
          'Find any book and where you can read it. Browse genres, cookbooks, and legal reading sources.',
        publisher: { '@id': `${siteUrl}/#organization` },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
