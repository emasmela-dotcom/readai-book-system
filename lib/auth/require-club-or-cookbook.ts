import { redirect } from 'next/navigation'
import { hasClubAccess } from '@/lib/auth/access'
import { isGuestFreeCookbook } from '@/lib/auth/guest-cookbook'
import { getSessionUser } from '@/lib/auth/session'

/** Club members stay gated; guests may open free cookbooks only. */
export async function requireClubOrCookbookAccess(
  book: { title?: string | null; subcategory?: string | null },
  nextPath: string,
): Promise<void> {
  const user = await getSessionUser()
  if (user && hasClubAccess(user)) return
  if (isGuestFreeCookbook(book)) return

  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent(nextPath)}`)
  }

  redirect('/subscribe')
}
