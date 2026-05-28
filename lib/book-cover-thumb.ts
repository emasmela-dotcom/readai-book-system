/** 1½″ square proxy — resized JPEG from our API (fast, cacheable). */
export function bookCoverThumbUrl(bookId: number): string {
  return `/api/book-cover/${bookId}`
}
