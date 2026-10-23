import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { pitchNotes } from '../notes'

// Checks that keep the pitch layer honest while its wording is reviewed:
// every label on the site has a note, every note appears somewhere, and
// the /pitch page keeps its running order.

/** Every .vue and .ts file of the site, outside the pitch layer and tests. */
function siteFiles(dir = 'src'): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return ['pitch', '__tests__'].includes(entry.name) ? [] : siteFiles(path)
    return /\.(vue|ts)$/.test(entry.name) ? [path] : []
  })
}
const site = siteFiles().map((path) => ({ path: relative('.', path), text: readFileSync(path, 'utf8') }))
const ids = pitchNotes.map((note) => note.id)

describe('pitch notes', () => {
  it('have unique ids', () => {
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('have a title, "today" and "here" for each', () => {
    for (const note of pitchNotes) {
      expect(
        [note.title, note.today, note.here].every((text) => text.trim() !== ''),
        note.id,
      ).toBe(true)
    }
  })

  it('cover every label on the site', () => {
    const used = site.flatMap(({ path, text }) =>
      // Plain id="…" and pitch="…" only: :id="…" is set from code, checked by the next test.
      [...text.matchAll(/<PitchNote\b[^>]*(?<![:\w-])id="([^"]+)"|(?<![:\w-])pitch="([^"]+)"/g)].map((m) => ({
        path,
        id: m[1] ?? m[2],
      })),
    )
    expect(used.length).toBeGreaterThan(0)
    for (const { path, id } of used) expect(ids, `${path} uses "${id}"`).toContain(id)
  })

  it('each appear somewhere on the site', () => {
    const everything = site.map(({ text }) => text).join('\n')
    const unused = ids.filter((id) => !everything.includes(`'${id}'`) && !everything.includes(`"${id}"`))
    expect(unused).toEqual([])
  })

  it('keep the /pitch running order', () => {
    expect(ids).toEqual([
      'intro',
      'hero-plays',
      'live-takeover',
      'nav',
      'continue-watching',
      'start-here',
      'card-previews',
      'series-row',
      'members-rows',
      'phone-tabs',
      'installable-app',
      'footer',
      'latest-articles',
      'live-countdown',
      'player-switch',
      'live-handoff',
      'live-phone',
      'live-reminders',
      'chat-kept',
      'chat-replay',
      'votes',
      'every-stream',
      'reading-lists',
      'own-player',
      'chat-sync',
      'one-source',
      'series-autoplay',
      'join-previews',
      'join-compare',
      'join-trial',
      'join-tiers',
      'show-archive',
      'courses-inside',
      'community-forums',
      'shop-inside',
      'buy-episode',
      'members-gate',
      'open-spaces',
      'article-comments',
      'article-reading-lists',
      'contributor-profiles',
      'members-shows',
      'articles-index',
      'account-page',
      'search',
    ])
  })
})
