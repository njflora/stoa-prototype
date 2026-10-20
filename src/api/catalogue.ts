// The catalogue API. Every page gets its episodes through these functions,
// never by importing a list. Each one names the endpoint it stands in for,
// so the real site can serve the same shapes from Laravel and change only
// API_BASE in client.ts.

import { getJson } from './client'
import type { ReadingItem } from '@/data/readingLists'
import type { Article, ArticleCategory, Episode, Host, LiveEvent, Series, Show } from '@/types/content'
import { formatEditionDate } from '@/utils/format'

interface Meta {
  generatedAt: string
  pageSize: number
  total: number
}

export interface EpisodePage {
  page: number
  pageCount: number
  total: number
  items: Episode[]
}

export interface Home {
  featured: Episode[]
  startHere: { showId: string; episode: Episode }[]
  latest: Episode[]
  /** The first 20 episodes of each show, by show id. */
  rows: Record<string, Episode[]>
  seriesSlugs: string[]
  /** The newest articles, for the homepage row. */
  articles: Article[]
}

/** A full article: its card fields plus the body and what comes after it. */
export interface ArticleDetail extends Article {
  /** Paragraphs; a paragraph starting "## " is a subheading. */
  body: string[]
  readingList: ReadingItem[]
  /** An episode on the same subject. */
  watchNext: Episode
}

export interface ArticlePage {
  page: number
  pageCount: number
  total: number
  items: Article[]
}

/**
 * Small reference data, fetched once before the app mounts (see main.ts),
 * so show names, hosts and series can be read instantly everywhere.
 */
export const reference = {
  shows: [] as Show[],
  hosts: [] as Host[],
  series: [] as Series[],
  live: null as LiveEvent | null,
  pageSize: 50,
}

// The demo data was generated on a fixed day. Moving every date forward by
// whole weeks keeps it current and keeps weekdays (and daily titles) right.
let shiftMs = 0
const WEEK_MS = 7 * 86_400_000

/** A date from the data files, moved forward to the present (see shiftMs). */
export function shiftDate(iso: string): string {
  return new Date(new Date(iso).getTime() + shiftMs).toISOString()
}

/** Fresh dates, and daily editions titled by their date. */
function normalise(episode: Episode): Episode {
  const publishedAt = shiftDate(episode.publishedAt)
  if (!episode.edition) return { ...episode, publishedAt }
  const show = reference.shows.find((s) => s.id === episode.showId)
  return { ...episode, publishedAt, title: `${show?.name ?? ''} | ${formatEditionDate(new Date(publishedAt))}` }
}

/** GET /api/shows, /api/hosts, /api/series, /api/live. Called once, before the app mounts. */
export async function loadReference(): Promise<void> {
  const [meta, shows, hosts, series, live] = await Promise.all([
    getJson<Meta>('meta.json'),
    getJson<Show[]>('shows.json'),
    getJson<Host[]>('hosts.json'),
    getJson<Series[]>('series.json'),
    getJson<LiveEvent>('live.json'),
  ])
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  shiftMs = Math.max(0, Math.floor((today.getTime() - new Date(meta.generatedAt).getTime()) / WEEK_MS)) * WEEK_MS

  reference.pageSize = meta.pageSize
  reference.hosts = hosts
  reference.live = live
  reference.shows = shows
  reference.shows = shows.map((s) => ({ ...s, freePreview: s.freePreview && normalise(s.freePreview) }))
  reference.series = series.map((s) => ({ ...s, episodes: s.episodes.map(normalise) }))
}

/** GET /api/home: everything the homepage shows first, in one request. */
export async function getHome(): Promise<Home> {
  const home = await getJson<Home>('home.json')
  return {
    ...home,
    featured: home.featured.map(normalise),
    startHere: home.startHere.map((s) => ({ ...s, episode: normalise(s.episode) })),
    latest: home.latest.map(normalise),
    rows: Object.fromEntries(Object.entries(home.rows).map(([id, list]) => [id, list.map(normalise)])),
    articles: home.articles.map(normaliseArticle),
  }
}

const normaliseArticle = <T extends Article>(article: T): T => ({ ...article, publishedAt: shiftDate(article.publishedAt) })

export type ArticleSort = 'newest' | 'popular' | 'controversial'
export type ArticlePeriod = 'week' | 'month' | 'all'

/**
 * GET /api/articles?category=&author=&sort=&period=&page=: 24 at a time.
 * "controversial" counts only pieces with enough engagement, then ranks
 * them as comment sections do: many votes, split close to evenly.
 */
export async function listArticles(
  page = 0,
  {
    category,
    authorId,
    sort = 'newest',
    period = 'month',
  }: { category?: ArticleCategory; authorId?: string; sort?: ArticleSort; period?: ArticlePeriod } = {},
): Promise<ArticlePage> {
  const base = authorId ? `author-${authorId}` : category ? category.toLowerCase() : 'all'
  const folder = authorId || sort === 'newest' ? base : sort === 'popular' ? `${base}/popular-${period}` : `${base}/controversial`
  const data = await getJson<ArticlePage>(`articles/pages/${folder}/${page}.json`)
  return { ...data, items: data.items.map(normaliseArticle) }
}

/** GET /api/articles/{id}. Undefined if there is no such article. */
export async function getArticle(id: string): Promise<ArticleDetail | undefined> {
  if (!/^[a-z0-9-]+$/.test(id)) return undefined
  try {
    const article = await getJson<ArticleDetail>(`articles/${id}.json`)
    return { ...normaliseArticle(article), watchNext: normalise(article.watchNext) }
  } catch {
    return undefined
  }
}

export type AccessFilter = 'all' | 'free' | 'members'
export type SortOrder = 'newest' | 'oldest' | 'popular'
export type Period = 'week' | 'month' | 'year' | 'all'

export interface EpisodeFilters {
  access?: AccessFilter
  sort?: SortOrder
  /** For "popular": how far back to look. */
  period?: Period
  /** Only episodes with this contributor. */
  host?: string
}

/** Where the stored answer for a set of filters lives. Access and contributor
 * folders exist for shows that mix access or have more than one presenter. */
function folderFor(showId: string, access: AccessFilter, host?: string): string {
  const base = access === 'all' ? `episodes/${showId}` : `episodes/${showId}/${access}`
  return host ? `${base}/host-${host}` : base
}

/**
 * GET /api/episodes?show=&access=&host=&sort=&period=&page=
 * 50 at a time. A real API sorts and filters in the database; here each
 * combination is a stored file. "Oldest first" reads the newest-first pages
 * from the other end, joining at most two of them. "Popular" is the 50
 * most-watched episodes published within the period.
 */
export async function listEpisodes(
  showId: string,
  page = 0,
  { access = 'all', sort = 'newest', period = 'month', host }: EpisodeFilters = {},
): Promise<EpisodePage> {
  const folder = folderFor(showId, access, host)
  const stored = (p: number) => getJson<EpisodePage>(`${folder}/${p}.json`)
  if (sort === 'popular') {
    const data = await getJson<EpisodePage>(`${folder}/popular/${period}.json`)
    return { ...data, items: data.items.map(normalise) }
  }
  if (sort === 'newest') {
    const data = await stored(page)
    return { ...data, items: data.items.map(normalise) }
  }
  const first = await stored(0)
  const { total, pageCount } = first
  const size = reference.pageSize
  // Positions in the newest-first list that make up this oldest-first page.
  const end = total - page * size
  const start = Math.max(0, end - size)
  if (end <= 0) return { page, pageCount, total, items: [] }
  const pages = [...new Set([Math.floor(start / size), Math.floor((end - 1) / size)])]
  const loaded = await Promise.all(pages.map((p) => (p === 0 ? first : stored(p))))
  const items = loaded.flatMap((p) => p.items).slice(start - pages[0]! * size, end - pages[0]! * size)
  return { page, pageCount, total, items: items.reverse().map(normalise) }
}

/** GET /api/episodes?host={hostId}&page={page}: one contributor's episodes across every show. */
export async function listEpisodesByHost(hostId: string, page = 0): Promise<EpisodePage> {
  const data = await getJson<EpisodePage>(`episodes/by-host/${hostId}/${page}.json`)
  return { ...data, items: data.items.map(normalise) }
}

/** GET /api/trending: the most-watched episodes of the last seven days, across every show. */
export async function getTrending(): Promise<Episode[]> {
  const data = await getJson<{ items: Episode[] }>('trending.json')
  return data.items.map(normalise)
}

/**
 * GET /api/episodes/{id}. Ids are "{show}-{sequence}", where the sequence
 * counts up from the show's first episode, so the page holding any episode
 * can be worked out without a separate lookup.
 */
export async function getEpisode(id: string): Promise<Episode | undefined> {
  const split = id.lastIndexOf('-')
  const showId = id.slice(0, split)
  const sequence = Number(id.slice(split + 1))
  const show = reference.shows.find((s) => s.id === showId)
  if (!show?.episodeCount || !Number.isInteger(sequence) || sequence < 1 || sequence > show.episodeCount) return undefined
  const page = Math.floor((show.episodeCount - sequence) / reference.pageSize)
  const { items } = await listEpisodes(showId, page)
  return items.find((e) => e.id === id)
}

/** Several episodes by id, skipping any that no longer exist. Pages are shared through the cache. */
export async function getEpisodes(ids: string[]): Promise<Episode[]> {
  const found = await Promise.all(ids.map(getEpisode))
  return found.filter((e): e is Episode => e !== undefined)
}
