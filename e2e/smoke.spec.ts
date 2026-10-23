import { expect, test } from '@playwright/test'
import { prepare } from './visit'

// The four journeys every release must keep working, in a real browser
// against the static preview as GitHub Pages serves it.

test('the homepage loads with something to watch', async ({ page }) => {
  const errors = await prepare(page)
  await page.goto('./')

  await expect(page).toHaveTitle(/Stoa/)
  await expect(page.getByRole('heading', { name: 'Start here' })).toBeVisible()
  await expect(page.locator('main a[href*="/watch/"]').first()).toBeVisible()
  expect(errors).toEqual([])
})

test('search finds an episode as you type', async ({ page }) => {
  const errors = await prepare(page)
  await page.goto('./')

  await page.getByRole('button', { name: 'Search' }).first().click()
  await page.getByPlaceholder('Episodes, series, hosts, topics…').fill('Agincourt')

  const results = page.getByRole('listbox', { name: 'Search results' })
  await expect(results.getByRole('option').filter({ hasText: 'Agincourt' }).first()).toBeVisible()
  await expect(page).toHaveURL(/search=Agincourt/)
  expect(errors).toEqual([])
})

test.describe('a locked episode shows the members’ gate', () => {
  // Buying needs an account, so a visitor is asked to sign in first.
  for (const [viewer, offer] of [
    ['signed-out', /Sign in to buy, £\d/],
    ['free', /Buy this episode, £\d/],
  ] as const) {
    test(`to a ${viewer} viewer`, async ({ page }) => {
      const errors = await prepare(page, viewer)
      await page.goto('./watch/chronos-117')

      await expect(page.getByText('This episode is for members')).toBeVisible()
      await expect(page.getByRole('link', { name: 'Upgrade to watch everything' })).toBeVisible()
      await expect(page.getByText(offer)).toBeVisible()
      // The gate replaces the player: no source to play.
      await expect(page.getByText(/Playing on/)).toHaveCount(0)
      expect(errors).toEqual([])
    })
  }
})

test.describe('on a phone (375 px)', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true })

  test('the live page puts the video above the chat, without sideways scrolling', async ({ page }) => {
    const errors = await prepare(page, 'signed-out', 'live')
    await page.goto('./live')

    const player = page.getByText(/Playing on/)
    const chat = page.getByRole('region', { name: 'Chat' })
    await expect(player).toBeVisible()
    await expect(chat).toBeVisible()

    const playerBox = await player.boundingBox()
    const chatBox = await chat.boundingBox()
    expect(playerBox && chatBox && playerBox.y < chatBox.y).toBe(true)

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    expect(errors).toEqual([])
  })
})
