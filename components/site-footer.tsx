import Link from 'next/link'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function SiteFooter() {
  const t = getDictionary()

  return (
    <footer className="border-t border-white/10 px-5 py-8 text-center md:px-8">
      <p className="text-xs tracking-wide text-[#e8e4df]/70">{t.footer.copyright}</p>
      <p className="mt-3 text-xs text-[#eadfce]">
        <Link href="/support" className="text-[#c9a96e] hover:text-[#d8be84] hover:underline">
          {t.footer.support}
        </Link>
      </p>
    </footer>
  )
}
