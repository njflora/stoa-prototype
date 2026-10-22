// Search across episodes, series, shows, hosts and articles.
//
// Two engines, one answer (SearchResults), so the search panel is the same:
// - Laravel mode: GET /api/search, Laravel Scout with Meilisearch on the
//   server (backend/app/Search/SiteSearch.php).
// - Static preview: MiniSearch (MIT licence) in the browser, over
//   public/data/search-docs.json. The index is built the first time someone
//   searches, never on other pages.

import MiniSearch from 'minisearch'
import { API_MODE, getFresh, getJson, query as queryString } from './client'
import { reference, shiftDate } from './catalogue'
import { hostNames } from '@/data/catalogue'
import type { Access, ArticleCategory } from '@/types/content'
import { formatEditionDate } from '@/utils/format'

export type ResultKind = 'episode' | 'series' | 'show' | 'host' | 'article'

export interface SearchHit {
  kind: ResultKind
  id: string
  title: string
  /** Where the result links to. */
  to: string
  showId?: string
  publishedAt?: string
  access?: Access
  seriesName?: string
  hostIds?: string[]
  category?: ArticleCategory
  /** The indexed words this result matched, for highlighting. */
  terms: string[]
}

export interface SearchResults {
  query: string
  total: number
  /** Milliseconds the search itself took, for the record. */
  tookMs: number
  groups: Record<ResultKind, SearchHit[]>
  /** How many matched in all, when a group holds only the best matches (the server). */
  counts?: Record<ResultKind, number>
}

interface EpisodeDoc {
  i: string
  t: string
  s: string
  h: string[]
  x: string
  d: string
  a: Access
  e?: 1
  /** The episode's series, by slug. */
  sl?: string
  /** "a" for an article: then s is its category and h its author. */
  k?: 'a'
}

interface Doc {
  id: string
  kind: ResultKind
  title: string
  show: string
  hosts: string
  text: string
  // Stored for display:
  to: string
  showId?: string
  publishedAt?: string
  access?: Access
  seriesName?: string
  hostIds?: string[]
  category?: ArticleCategory
}

/** Lower case, accents removed: "Crécy" and "crecy" match. */
export function normalise(term: string): string {
  return term
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

let index: Promise<MiniSearch<Doc>> | null = null
let newestMs = 0
let oldestMs = 0

async function buildIndex(): Promise<MiniSearch<Doc>> {
  const raw = await getJson<EpisodeDoc[]>('search-docs.json')

  const showName = (id: string) => reference.shows.find((s) => s.id === id)?.name ?? ''
  const docs: Doc[] = raw.map((e): Doc => {
    if (e.k === 'a') {
      const category = e.s as ArticleCategory
      return {
        id: `article:${e.i}`,
        kind: 'article',
        title: e.t,
        show: category,
        hosts: hostNames(e.h),
        text: e.x,
        to: `/articles/${e.i}`,
        publishedAt: shiftDate(e.d),
        hostIds: e.h,
        category,
      }
    }
    // By the slug stored with the episode, never guessed from its text (review note 10).
    const series = e.sl ? reference.series.find((s) => s.slug === e.sl) : undefined
    // Same date shift as the rest of the API, so results match the pages they open.
    const publishedAt = shiftDate(e.d)
    return {
      id: `episode:${e.i}`,
      kind: 'episode',
      title: e.e ? `${showName(e.s)} | ${formatEditionDate(new Date(publishedAt))}` : e.t,
      show: showName(e.s),
      hosts: hostNames(e.h),
      text: e.x,
      to: series ? `/watch/${e.i}?series=${series.slug}` : `/watch/${e.i}`,
      showId: e.s,
      publishedAt,
      access: e.a,
      seriesName: series ? series.name : undefined,
      hostIds: e.h,
    }
  })

  for (const s of reference.series) {
    docs.push({
      id: `series:${s.slug}`,
      kind: 'series',
      title: s.name,
      show: showName(s.showId),
      hosts: hostNames(s.episodes[0]?.hostIds ?? []),
      text: s.description,
      to: `/series/${s.slug}`,
      showId: s.showId,
      seriesName: s.name,
    })
  }
  for (const s of reference.shows) {
    docs.push({
      id: `show:${s.id}`,
      kind: 'show',
      title: s.name,
      show: s.name,
      hosts: hostNames(s.hostIds),
      text: s.tagline,
      to: `/shows/${s.id}`,
      showId: s.id,
    })
  }
  for (const h of reference.hosts) {
    // Every show they appear on, not only those they present regularly (review note 9).
    const presents = reference.shows.filter((s) => h.showIds?.includes(s.id)).map((s) => s.name)
    docs.push({
      id: `host:${h.id}`,
      kind: 'host',
      title: h.name,
      show: presents.join(' '),
      hosts: h.name,
      text: '',
      to: `/contributors/${h.id}`,
      hostIds: [h.id],
    })
  }

  const times = docs.filter((d) => d.publishedAt).map((d) => new Date(d.publishedAt!).getTime())
  newestMs = Math.max(...times)
  oldestMs = Math.min(...times)

  const search = new MiniSearch<Doc>({
    fields: ['title', 'show', 'hosts', 'text'],
    storeFields: ['kind', 'title', 'to', 'showId', 'publishedAt', 'access', 'seriesName', 'hostIds', 'category'],
    processTerm: (term) => normalise(term),
  })
  search.addAll(docs)
  return search
}

const emptyGroups = (): Record<ResultKind, SearchHit[]> => ({
  episode: [],
  series: [],
  show: [],
  host: [],
  article: [],
})

/**
 * The server's answer, with dates moved forward like the rest of the API, and
 * daily editions titled by their date as everywhere else.
 */
async function searchOnServer(query: string): Promise<SearchResults> {
  const results = await getFresh<SearchResults & { groups: Record<ResultKind, (SearchHit & { edition?: boolean })[]> }>(
    `search?${queryString({ q: query })}`,
  )
  const showName = (id?: string) => reference.shows.find((s) => s.id === id)?.name ?? ''
  for (const hits of Object.values(results.groups)) {
    for (const hit of hits) {
      if (hit.publishedAt) hit.publishedAt = shiftDate(hit.publishedAt)
      if (hit.edition && hit.publishedAt)
        hit.title = `${showName(hit.showId)} | ${formatEditionDate(new Date(hit.publishedAt))}`
    }
  }
  return { ...results, query }
}

/** Search everything. In the static preview, the first call loads and builds the index. */
export async function search(query: string): Promise<SearchResults> {
  const trimmed = query.trim()
  if (!trimmed) return { query, total: 0, tookMs: 0, groups: emptyGroups() }
  if (API_MODE === 'laravel') return searchOnServer(trimmed)

  index ??= buildIndex()
  // A failed load is forgotten, so the next search tries again.
  index.catch(() => (index = null))
  const engine = await index

  const started = performance.now()
  const results = engine.search(trimmed, {
    prefix: true,
    // Allow a typo or so in longer words: "agincort" finds Agincourt.
    fuzzy: (term) => (term.length > 4 ? 0.2 : false),
    combineWith: 'AND',
    boost: { title: 3, show: 1.5, hosts: 1.5, text: 1 },
    // Newer episodes edge ahead of older ones with the same match.
    boostDocument: (_id, _term, stored) => {
      const date = stored?.publishedAt as string | undefined
      if (!date || newestMs === oldestMs) return 1
      return 1 + 0.25 * ((new Date(date).getTime() - oldestMs) / (newestMs - oldestMs))
    },
  })
  const tookMs = performance.now() - started

  const groups = emptyGroups()
  for (const r of results) {
    const kind = r.kind as ResultKind
    groups[kind].push({
      kind,
      id: String(r.id).slice(kind.length + 1),
      title: r.title as string,
      to: r.to as string,
      showId: r.showId as string | undefined,
      publishedAt: r.publishedAt as string | undefined,
      access: r.access as Access | undefined,
      seriesName: r.seriesName as string | undefined,
      hostIds: r.hostIds as string[] | undefined,
      category: r.category as ArticleCategory | undefined,
      terms: r.terms,
    })
  }
  return { query, total: results.length, tookMs, groups }
}
