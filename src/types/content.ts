// The shape of the site's content. It mirrors the episode table in the
// planning doc (show, hosts, date, free or premium, series and part), so
// real feed data can replace the placeholder catalogue without code changes.

/** Who can watch an episode. Freemium is a free preview from a premium show. */
export type Access = 'free' | 'freemium' | 'premium'

export interface Host {
  id: string
  name: string
  /** Such as "Presenter, The Stoa Podcast". */
  role?: string
  bio?: string
  /** Shows they have appeared on. */
  showIds?: string[]
  episodeCount?: number
  articleCount?: number
}

export interface Show {
  id: string
  name: string
  tagline: string
  /** Whether the show as a whole is free or for members. */
  access: 'free' | 'premium'
  hostIds: string[]
  /** Three colours for the generated title card: glow, base, highlight. */
  palette: [string, string, string]
  /** Streamed live, so recordings come with a live chat replay. */
  streamedLive?: boolean
  /** Paging details, from the API. */
  episodeCount?: number
  pageCount?: number
  /** A free episode from this show, for previews. */
  freePreview?: Episode
  /** When new episodes arrive, such as "Live weekdays at 1:00 pm". */
  schedule?: string
  /** Episodes free to watch (free or free preview), and members-only ones. */
  freeCount?: number
  membersCount?: number
}

export interface SeriesInfo {
  name: string
  part: number
  of: number
}

export interface Episode {
  id: string
  showId: string
  title: string
  hostIds: string[]
  /** ISO 8601 date string. */
  publishedAt: string
  durationMin: number
  access: Access
  /** The running episode number, as in "The Stoa Podcast #1530". */
  number?: number
  series?: SeriesInfo
  /** Segment headlines, shown under the title and used by search. */
  topics?: string[]
  views?: number
  comments?: number
  /** Streamed live before it became a recording. */
  live?: boolean
  /** A daily show's main edition, titled by its date. */
  edition?: boolean
}

/** A run of episodes meant to be watched in order. */
export interface Series {
  /** Web-friendly name, such as "the-fall-of-the-republic". */
  slug: string
  name: string
  showId: string
  description: string
  /** Parts in order, Part I first. */
  episodes: Episode[]
  totalMin: number
}

export type ArticleCategory = 'Politics' | 'Analysis' | 'History' | 'Culture' | 'Economics'

export interface Article {
  id: string
  title: string
  /** One or two sentences under the headline. */
  standfirst: string
  authorId: string
  category: ArticleCategory
  /** ISO 8601 date string. */
  publishedAt: string
  readMin: number
  views?: number
  comments?: number
  likes?: number
  dislikes?: number
}

/** A like or a dislike, on comments and chat messages. */
export type Vote = 'up' | 'down'

export interface LiveEvent {
  showId: string
  number?: number
  title: string
  hostIds: string[]
  /** Concurrent viewers shown on the live badge. */
  viewers: number
  /** Local hour the show starts each day, used for the countdown. */
  startHour: number
}
