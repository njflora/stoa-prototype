// Lookups shared across the site, plus the hand-written articles.
//
// Shows, hosts, series and the live event come from the data API and are
// loaded once before the app mounts (loadReference in src/api/catalogue.ts),
// so these helpers can answer instantly. Episodes are never listed here:
// there are thousands, so pages fetch them through src/api/catalogue.ts.

import { reference } from '@/api/catalogue'
import type { Article, ArticleCategory, Episode, LiveEvent, Series, Show } from '@/types/content'
import { toRoman } from '@/utils/format'

const DAY_MS = 86_400_000

/** An ISO date `days` ago at the given local hour. */
function daysAgo(days: number, hour = 13): string {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  return new Date(date.getTime() - days * DAY_MS).toISOString()
}

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

function article(
  id: string,
  title: string,
  standfirst: string,
  authorId: string,
  category: ArticleCategory,
  days: number,
  readMin: number,
): Article {
  return { id, title, standfirst, authorId, category, publishedAt: daysAgo(days, 10), readMin }
}

export const articles: Article[] = [
  article(
    'centre-ground',
    'The Quiet Collapse of the Centre Ground',
    'Both main parties are losing the voters they once took for granted.',
    'andrew',
    'Politics',
    0,
    6,
  ),
  article(
    'winter-bills',
    'What the Energy Crunch Means for Winter Bills',
    'A plain guide to the price cap, and who is most exposed.',
    'rachel',
    'Analysis',
    1,
    8,
  ),
  article(
    'roman-generals',
    'Why the Romans Feared Their Own Generals',
    'A republic that won wars kept creating men too powerful to control.',
    'helen',
    'History',
    2,
    7,
  ),
  article(
    'long-novel',
    'In Defence of the Long Novel',
    'Why the books that ask the most of us still give the most back.',
    'richard',
    'Culture',
    3,
    5,
  ),
  article(
    'missing-middle',
    'Rents, Wages and the Missing Middle',
    'Where the money goes for people on average pay.',
    'neil',
    'Economics',
    4,
    9,
  ),
  article(
    'local-elections',
    'Local Elections Are Telling Us Something',
    'Small swings in council seats point to a larger shift.',
    'gary',
    'Politics',
    6,
    6,
  ),
  article(
    'shipping-lanes',
    'The Shipping Lanes Nobody Talks About',
    'Most of what we buy passes through a handful of narrow straits.',
    'rachel',
    'Analysis',
    8,
    7,
  ),
  article(
    'british-sitcom',
    'What Happened to the British Sitcom?',
    'A golden age, a long decline, and a few signs of life.',
    'tom',
    'Culture',
    10,
    5,
  ),
  article(
    'agincourt-myths',
    'Agincourt Without the Myths',
    'What the sources say about the battle, and what they leave out.',
    'helen',
    'History',
    12,
    10,
  ),
  article(
    'national-debt',
    'A Plain Guide to the National Debt',
    'How big it is, who holds it, and why the interest matters.',
    'sally',
    'Economics',
    14,
    8,
  ),
]
