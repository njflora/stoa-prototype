// Search across episodes, series, shows, hosts and articles.
//
// The prototype searches in the browser with MiniSearch (MIT licence), over
// public/data/search-docs.json. The index is built the first time someone
// searches, never on other pages. The real site can keep this search()
// function and swap its insides for a server engine such as Laravel Scout
// with Meilisearch: the page only sees SearchResults.

import MiniSearch from 'minisearch'
import { getJson } from './client'
import { reference, shiftDate } from './catalogue'
import { articles, hostNames } from '@/data/catalogue'
import type { Access } from '@/types/content'
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
  /** The indexed words this result matched, for highlighting. */
  terms: string[]
}

export interface SearchResults {
  query: string
  total: number
  /** Milliseconds the search itself took, for the record. */
  tookMs: number
  groups: Record<ResultKind, SearchHit[]>
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
}

/** Lower case, accents removed: "Crécy" and "crecy" match. */
export function normalise(term: string): string {
  return term.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

let index: Promise<MiniSearch<Doc>> | null = null
let newestMs = 0
let oldestMs = 0

async function buildIndex(): Promise<MiniSearch<Doc>> {
  const raw = await getJson<EpisodeDoc[]>('search-docs.json')

  const showName = (id: string) => reference.shows.find((s) => s.id === id)?.name ?? ''
  const docs: Doc[] = raw.map((e) => {
    const series = e.x && reference.series.find((s) => e.x.includes(s.name))
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
    docs.push({ id: `series:${s.slug}`, kind: 'series', title: s.name, show: showName(s.showId), hosts: hostNames(s.episodes[0]?.hostIds ?? []), text: s.description, to: `/series/${s.slug}`, showId: s.showId, seriesName: s.name })
  }
  for (const s of reference.shows) {
    docs.push({ id: `show:${s.id}`, kind: 'show', title: s.name, show: s.name, hosts: hostNames(s.hostIds), text: s.tagline, to: `/shows/${s.id}`, showId: s.id })
  }
  for (const h of reference.hosts) {
    const presents = reference.shows.filter((s) => s.hostIds.includes(h.id)).map((s) => s.name)
    docs.push({ id: `host:${h.id}`, kind: 'host', title: h.name, show: presents.join(' '), hosts: h.name, text: '', to: `/?search=${encodeURIComponent(h.name)}`, hostIds: [h.id] })
  }
  for (const a of articles) {
    docs.push({ id: `article:${a.id}`, kind: 'article', title: a.title, show: a.category, hosts: hostNames([a.authorId]), text: a.standfirst, to: `/articles/${a.id}`, publishedAt: a.publishedAt })
  }

  const times = docs.filter((d) => d.publishedAt).map((d) => new Date(d.publishedAt!).getTime())
  newestMs = Math.max(...times)
  oldestMs = Math.min(...times)

  const search = new MiniSearch<Doc>({
    fields: ['title', 'show', 'hosts', 'text'],
    storeFields: ['kind', 'title', 'to', 'showId', 'publishedAt', 'access', 'seriesName', 'hostIds'],
    processTerm: (term) => normalise(term),
  })
  search.addAll(docs)
  return search
}

const emptyGroups = (): Record<ResultKind, SearchHit[]> => ({ episode: [], series: [], show: [], host: [], article: [] })

/** Search everything. The first call loads and builds the index. */
export async function search(query: string): Promise<SearchResults> {
  const trimmed = query.trim()
  if (!trimmed) return { query, total: 0, tookMs: 0, groups: emptyGroups() }

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
      terms: r.terms,
    })
  }
  return { query, total: results.length, tookMs, groups }
}

