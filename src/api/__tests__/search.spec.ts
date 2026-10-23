// @vitest-environment jsdom
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { search as searchFn } from '../search'

// The static preview's search over the real generated data in public/data,
// the same files the site serves. A stand-in fetch reads them from disk.
// The first three tests mirror backend/tests/Feature/SearchTest.php.

/** The address fetch was asked for, whichever form it came in. */
const addressOf = (input: RequestInfo | URL) => (input instanceof Request ? input.url : input.toString())

async function serveFromDisk(url: RequestInfo | URL): Promise<Response> {
  const path = addressOf(url).replace(/^\//, '')
  return new Response(await readFile(resolve('public', path), 'utf8'))
}

/** A fresh page load: reference data loaded, search index not built yet. */
async function loadSearch(): Promise<typeof searchFn> {
  vi.resetModules()
  const { loadReference } = await import('../catalogue')
  await loadReference()
  return (await import('../search')).search
}

let search: typeof searchFn
beforeAll(async () => {
  vi.stubGlobal('fetch', vi.fn(serveFromDisk))
  search = await loadSearch()
}, 30_000)

const ids = (hits: { id: string }[]) => hits.map((hit) => hit.id)

describe('search in the static preview', () => {
  it('answers in the search panel’s shape, grouped by kind', async () => {
    const results = await search('Cannae')
    expect(Object.keys(results.groups)).toEqual(['episode', 'series', 'show', 'host', 'article'])
    expect(results.groups.episode[0]).toMatchObject({ id: 'chronos-42', showId: 'chronos' })
  })

  it('links an episode to its series from its record', async () => {
    const results = await search('Cannae')
    expect(results.groups.episode[0]?.to).toBe('/watch/chronos-42?series=hannibal')
  })

  it('finds a guest contributor by the shows they appear on', async () => {
    // Gary Lowther presents nothing regularly, but appears on The Forum.
    const results = await search('Forum')
    expect(ids(results.groups.host)).toContain('gary')
  })

  it('finds episodes and articles alike', async () => {
    const results = await search('Agincourt')
    expect(results.groups.episode[0]?.id).toBe('chronos-121')
    expect(ids(results.groups.article)).toContain('agincourt-myths')
  })

  it('stores words without accents, so "crecy" matches "Crécy" as itself, not as a typo', async () => {
    const hit = (await search('crecy')).groups.episode.find((h) => h.id === 'chronos-120')
    expect(hit?.terms).toContain('crecy')
  })

  it.each([
    ['with a typo in a longer word', 'agincort', 'chronos-121'],
    ['from the start of a word', 'agincou', 'chronos-121'],
  ])('matches %s ("%s")', async (_, query, expected) => {
    expect(ids((await search(query)).groups.episode)).toContain(expected)
  })

  it('needs every word to match', async () => {
    expect((await search('Agincourt Cannae')).total).toBe(0)
  })

  it('answers a blank search with nothing, without loading anything', async () => {
    const fetchCalls = vi.mocked(fetch).mock.calls.length
    const results = await search('   ')
    expect(results.total).toBe(0)
    expect(vi.mocked(fetch).mock.calls.length).toBe(fetchCalls)
  })
})

describe('when the search data fails to load', () => {
  afterEach(() => vi.stubGlobal('fetch', vi.fn(serveFromDisk)))

  it('tries again on the next search', async () => {
    const fresh = await loadSearch()
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: RequestInfo | URL) =>
        addressOf(url).endsWith('search-docs.json') ? Promise.reject(new TypeError('offline')) : serveFromDisk(url),
      ),
    )
    await expect(fresh('Cannae')).rejects.toThrow()

    vi.stubGlobal('fetch', vi.fn(serveFromDisk))
    expect((await fresh('Cannae')).groups.episode[0]?.id).toBe('chronos-42')
  }, 30_000)
})
