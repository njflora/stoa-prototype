// Lookups shared across the site.
//
// Shows, hosts, series and the live event come from the data API and are
// loaded once before the app mounts (loadReference in src/api/catalogue.ts),
// so these helpers can answer instantly. Episodes are never listed here:
// there are thousands, so pages fetch them through src/api/catalogue.ts.

import { reference } from '@/api/catalogue'
import type { ArticleCategory, Episode, LiveEvent, Series, Show } from '@/types/content'
import { toRoman } from '@/utils/format'

const DAY_MS = 86_400_000

/** An ISO date `days` ago at the given local hour. */
export function listShows(): Show[] {
  return reference.shows
}

export function getShow(id: string): Show {
  const show = reference.shows.find((s) => s.id === id)
  if (!show) throw new Error(`Unknown show: ${id}`)
  return show
}

export function hostNames(ids: string[]): string {
  const names = ids.map((id) => reference.hosts.find((h) => h.id === id)?.name).filter(Boolean)
  if (names.length <= 2) return names.join(' & ')
  return `${names.slice(0, -1).join(', ')} & ${names.at(-1)}`
}

export function getLiveEvent(): LiveEvent {
  if (!reference.live) throw new Error('The live event has not loaded yet')
  return reference.live
}

/** Text for the title card: series and part, or the episode number. */
export function episodeLabel(episode: Episode): string {
  if (episode.series) return `${episode.series.name} · Part ${toRoman(episode.series.part)}`
  if (episode.number) return `#${episode.number}`
  return ''
}

export function isNew(episode: Episode, now = Date.now()): boolean {
  return now - new Date(episode.publishedAt).getTime() < 2 * DAY_MS
}

/** "The Hundred Years' War" → "the-hundred-years-war" */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Every series, newest first. */
export function listAllSeries(): Series[] {
  return reference.series
}

export function getSeries(slug: string): Series | undefined {
  return reference.series.find((s) => s.slug === slug)
}

/** The series an episode belongs to, if any. */
export function seriesOf(episode: Episode): Series | undefined {
  return episode.series ? getSeries(slugify(episode.series.name)) : undefined
}

/** Colours for article thumbnails: a dark base and an accent per category. */
export const articleCategoryColours: Record<ArticleCategory, { base: string; accent: string }> = {
  Politics: { base: '#2a0f22', accent: '#c04d93' },
  Analysis: { base: '#0b1726', accent: '#4f8fc0' },
  History: { base: '#08221f', accent: '#2a9d8f' },
  Culture: { base: '#170d2e', accent: '#8b5cf6' },
  Economics: { base: '#221c05', accent: '#d5b720' },
}
