import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 px-5 py-8 text-center md:px-8">
      <p className="text-xs tracking-wide text-[#e8e4df]/70">
        © 2026 ReadAI365
      </p>
      <p className="mt-2 text-xs text-[#eadfce]">
        <Link href="/support" className="text-[#c9a96e] hover:text-[#d8be84] hover:underline">
          Contact support
        </Link>
      </p>
    </footer>
  )
}
