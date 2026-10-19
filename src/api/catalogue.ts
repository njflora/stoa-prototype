// The catalogue API. Every page gets its episodes through these functions,
// never by importing a list. Each one names the endpoint it stands in for,
// so the real site can serve the same shapes from Laravel and change only
// API_BASE in client.ts.

import { getJson } from './client'
import type { Episode, Host, LiveEvent, Series, Show } from '@/types/content'
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

/** Fresh dates, and daily editions titled by their date. */
function normalise(episode: Episode): Episode {
  const publishedAt = new Date(new Date(episode.publishedAt).getTime() + shiftMs).toISOString()
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
  }
}

/** GET /api/episodes?show={showId}&page={page}: 50 at a time, newest first. */
export async function listEpisodes(showId: string, page = 0): Promise<EpisodePage> {
  const data = await getJson<EpisodePage>(`episodes/${showId}/${page}.json`)
  return { ...data, items: data.items.map(normalise) }
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
