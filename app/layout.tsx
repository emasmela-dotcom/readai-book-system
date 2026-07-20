import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { GoogleAnalytics } from '@/components/google-analytics'
import { SiteJsonLd } from '@/components/site-json-ld'
import { SiteFooter } from '@/components/site-footer'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-playfair',
})

const siteUrl = 'https://www.readai365.com'
const siteTitle = 'ReadAI365 — Find any book and where you can read it'
const siteDescription =
  'Search any book title and find legal places to read it online. Browse genres, cookbooks, and reading rooms. Try ReadAI365 free for 14 days.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s | ReadAI365',
  },
  description: siteDescription,
  applicationName: 'ReadAI365',
  keywords: [
    'ReadAI365',
    'book search',
    'where to read books online',
    'book club',
    'public domain books',
    'legal reading sources',
    'cookbooks online',
    'find free books',
  ],
  authors: [{ name: 'ReadAI365' }],
  creator: 'ReadAI365',
  publisher: 'ReadAI365',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'ReadAI365',
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'books',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <GoogleAnalytics />
        <SiteJsonLd />
      </head>
      <body className={`${inter.className} bg-[#0e0c0a] font-sans text-[#e8e4df]/90 antialiased`}>
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  )
}
