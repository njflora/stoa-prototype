import type { Page } from '@playwright/test'

type Viewer = 'signed-out' | 'free' | 'member' | 'staff'
type Phase = 'upcoming' | 'live' | 'break' | 'members' | 'ended'

/**
 * Prepares a visit before the first page loads: the welcome animation
 * already seen, and the demo panel's viewer and live phase set. Returns
 * the page's uncaught errors, so a test can check there were none.
 */
export async function prepare(page: Page, viewer: Viewer = 'signed-out', phase: Phase = 'live'): Promise<Error[]> {
  const errors: Error[] = []
  page.on('pageerror', (error) => errors.push(error))
  await page.addInitScript(
    ({ viewer, phase }) => {
      localStorage.setItem('stoa-intro-seen', 'true')
      localStorage.setItem('stoa-demo', JSON.stringify({ viewer, phase }))
    },
    { viewer, phase },
  )
  return errors
}
