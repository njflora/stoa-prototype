// The shape of the site's content. It mirrors the episode table in the
// planning doc (show, hosts, date, free or premium, series and part), so
// real feed data can replace the placeholder catalogue without code changes.

/** Who can watch an episode. Freemium is a free preview from a premium show. */
export type Access = 'free' | 'freemium' | 'premium'

export interface Host {
  id: string
  name: string
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
  number?: number
  series?: SeriesInfo
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
}

export interface LiveEvent {
  showId: string
  title: string
  hostIds: string[]
  /** Concurrent viewers shown on the live badge. */
  viewers: number
  /** Local hour the show starts each day, used for the countdown. */
  startHour: number
}
