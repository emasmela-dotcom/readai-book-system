/** U.S. works published before this year are generally public domain. */
export const US_PUBLIC_DOMAIN_CUTOFF_YEAR = 1929

export function canOpenInReadAI(firstPublishYear: number | null | undefined): boolean {
  if (firstPublishYear == null || !Number.isFinite(firstPublishYear)) return true
  return firstPublishYear < US_PUBLIC_DOMAIN_CUTOFF_YEAR
}
