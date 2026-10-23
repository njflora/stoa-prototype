// Keeping the keyboard inside an open dialog or sheet. While it is open,
// Tab and Shift+Tab go round its own links, buttons and fields and never
// reach the page behind it. Each dialog calls keepTabInside() from its own
// keydown handler.

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/** Elements in the container that Tab can reach, in order. Hidden ones are left out. */
export function focusableIn(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => el.getClientRects().length > 0 && !el.closest('[inert]'),
  )
}

/**
 * Call on keydown while the container is open. On Tab it wraps from the last
 * element to the first, on Shift+Tab from the first to the last, and if focus
 * has somehow left the container, it brings it back. Other keys pass through.
 */
export function keepTabInside(event: KeyboardEvent, container: HTMLElement | null | undefined): void {
  if (event.key !== 'Tab' || !container) return
  const items = focusableIn(container)
  const first = items[0]
  const last = items.at(-1)
  if (!first || !last) return
  const active = document.activeElement
  if (!container.contains(active)) {
    event.preventDefault()
    first.focus()
  } else if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}
