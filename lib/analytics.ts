type GtagFn = (...args: unknown[]) => void

declare global {
  interface Window {
    gtag?: GtagFn
    dataLayer?: unknown[]
  }
}

/** Fire a Google Analytics event (only if gtag is loaded). */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
  onDone?: () => void,
): void {
  if (typeof window === 'undefined') {
    onDone?.()
    return
  }

  const gtag = window.gtag
  if (!gtag) {
    onDone?.()
    return
  }

  let finished = false
  const finish = () => {
    if (finished) return
    finished = true
    onDone?.()
  }

  // Don't wait forever if Analytics is slow — still continue the page flow.
  const timeout = window.setTimeout(finish, 800)

  gtag('event', name, {
    ...params,
    event_callback: () => {
      window.clearTimeout(timeout)
      finish()
    },
  })
}
