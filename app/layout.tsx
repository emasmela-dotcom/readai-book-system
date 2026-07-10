import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { GoogleAnalytics } from '@/components/google-analytics'
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

export const metadata: Metadata = {
  title: 'ReadAI — AI-Powered Reading Club',
  description: 'ReadAI: a growing library with an AI literary guide for your book club.',
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
