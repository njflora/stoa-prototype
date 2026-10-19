// Placeholder catalogue. Every show, host and episode here is invented.
// The shape matches src/types/content.ts, so the cleaned feed data can
// replace this file later without touching the components.

import type {
  Access,
  Article,
  ArticleCategory,
  Episode,
  Host,
  LiveEvent,
  Show,
} from '@/types/content'
import { formatLongDate, toRoman } from '@/utils/format'

const DAY_MS = 86_400_000

/** An ISO date `days` ago at the given local hour. */
function daysAgo(days: number, hour = 13): string {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  return new Date(date.getTime() - days * DAY_MS).toISOString()
}

export const hosts: Host[] = [
  { id: 'marcus', name: 'Marcus Hale' },
  { id: 'elena', name: 'Elena Voss' },
  { id: 'tom', name: 'Tom Archer' },
  { id: 'priya', name: 'Priya Nair' },
  { id: 'owen', name: 'Owen Clarke' },
  { id: 'ruth', name: 'Ruth Keller' },
  { id: 'sam', name: 'Sam Okafor' },
  { id: 'james', name: 'James Whitlow' },
  { id: 'nadia', name: 'Nadia Ferrante' },
]

export const shows: Show[] = [
  {
    id: 'stoa-podcast',
    name: 'The Stoa Podcast',
    tagline: 'The daily flagship, live every weekday',
    access: 'free',
    hostIds: ['marcus', 'elena', 'tom'],
    palette: ['#c04d93', '#2a0f22', '#f0a6ca'],
  },
  {
    id: 'morning-brief',
    name: 'Morning Brief',
    tagline: 'The day ahead in twenty minutes',
    access: 'free',
    hostIds: ['sam'],
    palette: ['#d5b720', '#2a2205', '#f6e7a1'],
  },
  {
    id: 'conversations',
    name: 'Conversations',
    tagline: 'Long-form interviews with interesting people',
    access: 'free',
    hostIds: ['elena'],
    palette: ['#8b5cf6', '#170d2e', '#d8c8ff'],
  },
  {
    id: 'chronos',
    name: 'Chronos',
    tagline: 'History told in full, series by series',
    access: 'premium',
    hostIds: ['ruth'],
    palette: ['#2a9d8f', '#08221f', '#e9c46a'],
  },
  {
    id: 'statecraft',
    name: 'Statecraft',
    tagline: 'Geopolitics without the noise',
    access: 'premium',
    hostIds: ['priya'],
    palette: ['#4f8fc0', '#0b1726', '#a8dadc'],
  },
  {
    id: 'ledger',
    name: 'Ledger',
    tagline: 'Economics you can actually use',
    access: 'premium',
    hostIds: ['owen'],
    palette: ['#6a994e', '#101b0c', '#e3f0c8'],
  },
  {
    id: 'the-forum',
    name: 'The Forum',
    tagline: 'The panel show, live for members',
    access: 'premium',
    hostIds: ['marcus', 'tom', 'sam', 'owen'],
    palette: ['#e76f51', '#260d06', '#f4a261'],
  },
]

/** Builds a run of episodes, newest first, spaced `every` days apart. */
function run(
  showId: string,
  titles: string[],
  options: {
    firstNumber?: number
    offset?: number
    every?: number
    hour?: number
    durationMin?: number
    access?: Access
  } = {},
): Episode[] {
  const show = shows.find((s) => s.id === showId)!
  const { offset = 0, every = 1, hour = 13, durationMin = 60 } = options
  const access = options.access ?? (show.access === 'free' ? 'free' : 'premium')

  return titles.map((title, i) => ({
    id: `${showId}-${i}`,
    showId,
    title,
    hostIds: show.hostIds,
    publishedAt: daysAgo(offset + i * every, hour),
    durationMin,
    access,
    number: options.firstNumber === undefined ? undefined : options.firstNumber - i,
  }))
}

const stoaPodcast = run(
  'stoa-podcast',
  [
    'Parliament Returns',
    'The Budget Nobody Wanted',
    'Energy Prices Bite',
    'Strikes and Standstills',
    'The Housing Question',
    'A Week in Westminster',
    'Polls, Promises and Problems',
    'The Border Debate',
    'Free Speech on Trial',
    "Europe's New Mood",
    'The Cost of Net Zero',
    'Councils in Crisis',
  ],
  { firstNumber: 1431, offset: 1, durationMin: 95 },
)

const morningBrief = Array.from({ length: 10 }, (_, i): Episode => {
  const publishedAt = daysAgo(i, 8)
  return {
    id: `morning-brief-${i}`,
    showId: 'morning-brief',
    title: `Morning Brief | ${formatLongDate(new Date(publishedAt))}`,
    hostIds: ['sam'],
    publishedAt,
    durationMin: 22,
    access: 'free',
  }
})

const conversations: Episode[] = run(
  'conversations',
  [
    'The Secret to Great Storytelling | with Clara Moss',
    'What Makes a City Work | with Daniel Ferris',
    'Inside the Newsroom | with Hannah Price',
    'The Craft of Biography | with Leo Grant',
    'Rebuilding Trust in Institutions | with Asha Patel',
    'A Life in Archaeology | with Ian Doyle',
    'Why Maps Lie | with Grace Lin',
  ],
  { offset: 2, every: 5, durationMin: 70 },
)

/** Chronos runs in multi-part series, released weekly, with free extras. */
const chronosSeries: { name: string; parts: string[] }[] = [
  {
    name: 'The Fall of the Republic',
    parts: [
      'The Gracchi',
      'Marius and Sulla',
      'The First Triumvirate',
      'Crossing the Rubicon',
      'The Ides of March',
    ],
  },
  {
    name: 'Byzantium Rising',
    parts: ['A New Rome', "Justinian's Gamble", 'The Plague Years', 'Heraclius and the Persians'],
  },
  {
    name: "The Hundred Years' War",
    parts: ['A Disputed Crown', 'Crécy', 'Agincourt'],
  },
]

function buildChronos(): Episode[] {
  // Oldest first, then reversed so the newest part comes first.
  const oldestFirst: Omit<Episode, 'publishedAt' | 'number' | 'id'>[] = []

  chronosSeries.forEach((series, seriesIndex) => {
    series.parts.forEach((title, partIndex) => {
      oldestFirst.push({
        showId: 'chronos',
        title,
        hostIds: ['ruth'],
        durationMin: 85,
        access: 'premium',
        series: { name: series.name, part: partIndex + 1, of: series.parts.length },
      })
    })
    if (seriesIndex === 0) {
      oldestFirst.push({
        showId: 'chronos',
        title: 'Chronos Extra | How Empires Decline',
        hostIds: ['ruth'],
        durationMin: 50,
        access: 'freemium',
      })
    }
  })

  oldestFirst.push({
    showId: 'chronos',
    title: 'Chronos Extra | Reading the Ancients',
    hostIds: ['ruth'],
    durationMin: 45,
    access: 'freemium',
  })

  const firstNumber = 270
  return oldestFirst
    .map((episode, i) => ({
      ...episode,
      id: `chronos-${i}`,
      number: firstNumber + i,
      publishedAt: daysAgo((oldestFirst.length - 1 - i) * 7 + 1, 13),
    }))
    .reverse()
}

const chronos = buildChronos()

const statecraft = [
  ...run(
    'statecraft',
    [
      'The Great Energy Crunch',
      'Elections Across the Gulf',
      "China's Long Game",
      'The Arctic Scramble',
      'Sanctions That Backfired',
      'Water Wars',
      'The Shipping Lanes',
      "Africa's New Partners",
    ],
    { firstNumber: 69, offset: 2, every: 7, hour: 15, durationMin: 75 },
  ),
  {
    id: 'statecraft-preview',
    showId: 'statecraft',
    title: 'Statecraft Preview | Reading a Map of Power',
    hostIds: ['priya'],
    publishedAt: daysAgo(30, 15),
    durationMin: 25,
    access: 'freemium',
  } satisfies Episode,
]

const ledger = run(
  'ledger',
  [
    'The Petrodollar Explained',
    'Why Rents Keep Rising',
    'Debt, Deficits and You',
    'The Pension Problem',
    "Inflation's Long Tail",
    'What Productivity Means',
    'Gold Standard Myths',
    'Tax Code Tangles',
  ],
  { offset: 4, every: 7, hour: 11, durationMin: 55 },
)

const theForum = run(
  'the-forum',
  [
    'Who Would Win?',
    'Films We Will Defend',
    'The Best Decade for Music',
    'Desert Island Books',
    'Ranking Prime Ministers',
    'Underrated Inventions',
    'The Great Debate Night',
  ],
  { firstNumber: 128, offset: 3, every: 7, hour: 19, durationMin: 110 },
)

export const episodes: Episode[] = [
  ...stoaPodcast,
  ...morningBrief,
  ...conversations,
  ...chronos,
  ...statecraft,
  ...ledger,
  ...theForum,
].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

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
    'marcus',
    'Politics',
    0,
    6,
  ),
  article(
    'winter-bills',
    'What the Energy Crunch Means for Winter Bills',
    'A plain guide to the price cap, and who is most exposed.',
    'priya',
    'Analysis',
    1,
    8,
  ),
  article(
    'roman-generals',
    'Why the Romans Feared Their Own Generals',
    'A republic that won wars kept creating men too powerful to control.',
    'ruth',
    'History',
    2,
    7,
  ),
  article(
    'long-novel',
    'In Defence of the Long Novel',
    'Why the books that ask the most of us still give the most back.',
    'elena',
    'Culture',
    3,
    5,
  ),
  article(
    'missing-middle',
    'Rents, Wages and the Missing Middle',
    'Where the money goes for people on average pay.',
    'owen',
    'Economics',
    4,
    9,
  ),
  article(
    'local-elections',
    'Local Elections Are Telling Us Something',
    'Small swings in council seats point to a larger shift.',
    'james',
    'Politics',
    6,
    6,
  ),
  article(
    'shipping-lanes',
    'The Shipping Lanes Nobody Talks About',
    'Most of what we buy passes through a handful of narrow straits.',
    'priya',
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
    'ruth',
    'History',
    12,
    10,
  ),
  article(
    'national-debt',
    'A Plain Guide to the National Debt',
    'How big it is, who holds it, and why the interest matters.',
    'nadia',
    'Economics',
    14,
    8,
  ),
]

export const liveEvent: LiveEvent = {
  showId: 'stoa-podcast',
  title: 'The Stoa Podcast #1432',
  hostIds: ['marcus', 'elena', 'tom'],
  viewers: 1984,
  startHour: 13,
}

// Lookups. Maps make each lookup instant rather than a search through the array.
const showsById = new Map(shows.map((s) => [s.id, s]))
const hostsById = new Map(hosts.map((h) => [h.id, h]))
const episodesById = new Map(episodes.map((e) => [e.id, e]))

export function getShow(id: string): Show {
  const show = showsById.get(id)
  if (!show) throw new Error(`Unknown show: ${id}`)
  return show
}

export function getEpisode(id: string): Episode | undefined {
  return episodesById.get(id)
}

export function hostNames(ids: string[]): string {
  const names = ids.map((id) => hostsById.get(id)?.name).filter(Boolean)
  if (names.length <= 2) return names.join(' & ')
  return `${names.slice(0, -1).join(', ')} & ${names.at(-1)}`
}

export function episodesForShow(showId: string): Episode[] {
  return episodes.filter((e) => e.showId === showId)
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

/**
 * One way in per show for newcomers. Free shows start with the latest
 * episode. Premium shows start with a free preview if there is one,
 * otherwise with part one of their first series.
 */
export function startHereEpisodes(): { show: Show; episode: Episode }[] {
  return shows.map((show) => {
    const list = episodesForShow(show.id)
    const preview = list.find((e) => e.access === 'freemium')
    const firstPart = [...list].reverse().find((e) => e.series?.part === 1)
    const episode = show.access === 'free' ? list[0]! : (preview ?? firstPart ?? list.at(-1)!)
    return { show, episode }
  })
}

/** Rotating hero picks for when nothing is live. */
export function featuredEpisodes(): Episode[] {
  const latest = (showId: string, access?: Access) =>
    episodesForShow(showId).find((e) => !access || e.access === access)!
  return [
    latest('stoa-podcast'),
    latest('chronos', 'premium'),
    latest('conversations'),
    latest('statecraft', 'freemium'),
  ]
}
