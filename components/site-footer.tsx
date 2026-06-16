import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 px-5 py-6 text-center md:px-8">
      <p className="text-xs text-[#eadfce]">
        <Link href="/support" className="text-[#c9a96e] hover:underline">
          Contact support
        </Link>
      </p>
    </footer>
  )
}
