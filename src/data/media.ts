// Artwork and video for the site. Every file is public domain or CC0, and
// comes from media.generated.json, which scripts/media/fetch_media.py
// writes after checking each licence. CREDITS.md lists them all.

import manifest from './media.generated.json'
import type { Episode } from '@/types/content'
import { seededRandom } from '@/utils/random'

export interface Artwork {
  id: string
  /** What it illustrates, such as "show:chronos" or "series:Roman Resurgence". */
  for: string
  alt: string
  name: string
  artist: string
  date: string
  licence: string
  sourceUrl: string
  /** 640px wide, for cards. */
  card: string
  /** 1280px wide, for heroes and players. */
  hero: string
}

/** Turns a path from the manifest into a URL that works under any base path. */
export function mediaUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`
}

export const artworks: Artwork[] = Object.entries(manifest.images).map(([id, art]) => ({ id, ...art }))

export const heroVideo = manifest.video

const byShow = new Map<string, Artwork[]>()
const bySeries = new Map<string, Artwork>()
for (const art of artworks) {
  const [kind, key] = art.for.split(/:(.*)/s) as [string, string]
  if (kind === 'show') byShow.set(key, [...(byShow.get(key) ?? []), art])
  if (kind === 'series') bySeries.set(key, art)
}

/** Every artwork for a show. Chronos also draws on its series artwork. */
export function artForShow(showId: string): Artwork[] {
  const own = byShow.get(showId) ?? []
  if (showId !== 'chronos') return own
  return [...own, ...bySeries.values()]
}

export function artForSeries(name: string): Artwork | undefined {
  return bySeries.get(name)
}

/**
 * The artwork for one episode: its series artwork if it has one, otherwise a
 * painting from its show, picked by the episode id so it never changes.
 */
/** An episode's painting. Needs only its id, show and series name, so search results can use it too. */
export function artForEpisode(episode: Pick<Episode, 'id' | 'showId'> & { series?: { name: string } }): Artwork {
  const series = episode.series && bySeries.get(episode.series.name)
  if (series) return series
  const pool = artForShow(episode.showId)
  const random = seededRandom(`${episode.id}:art`)
  return pool[Math.floor(random() * pool.length)] ?? artworks[0]!
}
