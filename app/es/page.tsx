import type { Metadata } from 'next'
import ReadAIHome from '@/components/readai-home'
import { getDictionary } from '@/lib/i18n/dictionaries'

export const metadata: Metadata = {
  title: getDictionary('es').meta.title,
  description: getDictionary('es').meta.description,
  alternates: {
    canonical: '/es',
    languages: {
      en: '/',
      es: '/es',
      'x-default': '/',
    },
  },
}

export default function SpanishHomePage() {
  return <ReadAIHome locale="es" />
}
